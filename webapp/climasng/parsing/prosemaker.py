
import re
import shlex
import simplejson # can't use native json because we have to json-ify Decimals
from decimal import *

from docpart import DocPart
from conditionparser import ConditionParser
from replacementparser import ReplacementParser

class ProseMaker(object):

    def __init__(self):
        self._data = {}
        self._json = ''
        self._source = ''

    ## data property ------------------------------------------------
    @property
    def data(self):
        """ The 'data' property """
        return self._data

    @data.setter
    def data(self, value):
        self._data = value
        # if they set data directly, we'll keep a json string too.
        self._json = simplejson.dumps(value, indent=4, use_decimal=True)
        return self._data

    @data.deleter
    def data(self):
        del self._data

    ## dataJSON property --------------------------------------------
    @property
    def dataJSON(self):
        """ 'dataJSON' property, data as a JSON string """
        return self._json

    @dataJSON.setter
    def dataJSON(self, value):
        self._json = value
        self._data = simplejson.loads(
            value,
            # can't use simplejson's use_decimal arg here because
            # that only applies to floats, we want ints etc as well.
            parse_float=Decimal,
            parse_int=Decimal,
            parse_constant=Decimal
        )
        return self._json

    @dataJSON.deleter
    def dataJSON(self):
        del self._json
        del self._data

    ## source property ----------------------------------------------
    @property
    def source(self):
        """ The 'source' property """
        return self._source

    @source.setter
    def source(self, value):
        self._source = value

        raw_parts = self._source.split('[[')
        self._parts = [DocPart(raw_part) for raw_part in raw_parts]

        return self._source

    @source.deleter
    def source(self):
        del self._source

    ## doc property -------------------------------------------------
    @property
    def doc(self):
        """ The 'doc' property """

        resolved_parts = [self.resolve_document_part(part) for part in self._parts]

        return(''.join(resolved_parts))

    # ---------------------------------------------------------------
    def resolve_document_part(self, doc_part):
        if self.resolve_condition(doc_part.condition):
            return self.resolve_content(doc_part.content)
        else:
            return ''

    # ---------------------------------------------------------------
    def resolve_condition(self, condition):
        # force the condition to be stringy
        condition = str(condition)

        # first, resolve all the {{ replacements }} in the condition
        condition = self.resolve_content(condition)

        # then use a condition parser to get the answer
        cp = ConditionParser(condition, self._data)
        return cp.result

    # ---------------------------------------------------------------
    def resolve_content(self, content):

        content = str(content) # force it into a string form (probably it's already a string)

        if len(self.data) > 0: # no need to insert vars if there aren't any vars

            replacements = 1
            # repeatedly perform variable replacement until we didn't do any
            # replacements.  That means you can have a replacement inside
            # a varname.  For example, if you have this source:
            #
            #     "Today you have to wake up at {{alarm_{{daytype}}_time}} sharp!"
            #
            # And this data:
            #
            # {   "daytype":            "weekday",
            #     "alarm_weekday_time": "6am",
            #     "alarm_weekend_time": "9am"    }
            #
            # Your result will be:
            #
            #     "Today you have to wake up at 6am sharp!"
            #
            # But if you change the daytype to "weekend", you'll get 9am in the
            # result.  Cool hey.

            old_content = ''
            # keep going until there were no changes
            while (content != old_content):

                old_content = content
                # this regex will catch {{placeholders}} that have no inner
                # placeholders, so the most nested {{curlies}} get resolved
                # first.
                content = re.sub(
                    r'{{\s*([^\{\}]+?)\s*}}',
                    self.resolve_replacement,
                    content
                )

        return content

    # ---------------------------------------------------------------
    def resolve_replacement(self, match):

        # match.group(1) is all the stuff that was {{ inside the
        # curlies }}.  the 1st thing is the varname; that's followed
        # by a (possibly zero-length) list of transformations.  Eg:
        # {{ varname, trans1, trans2 trans2arg, trans3 }}
        #
        # It gets pretty complicated because you can quote the args,
        # and a quoted arg can have commas in it, etc... liuckily
        # there's a replacement parser to help out.

        try:

            val, transforms = ReplacementParser(match.group(1), self._data).result

            if type(val) != Decimal:
                try:
                    # Decimal(1.1) gives 1.100000000000000088817841970012523233890533447265625
                    # Decimal(repr(1.1)) gives 1.1
                    val = Decimal(repr(val))
                except InvalidOperation:
                    # that's okay, it doesn't want to be a Decimal
                    pass

            # function for doing rounding
            def round(val, unit, method):
                unit = Decimal(unit)
                val = val / unit
                val = val.quantize(Decimal('1'), context=Context(rounding=method))
                val = val * unit
                # turn -0 into 0
                if val.is_zero():
                    val = Decimal('0')
                return val

            for transform in transforms:

                trans_name, trans_args = transform

                if trans_name == 'absolute':
                    val = abs(val)
                    continue

                if trans_name == 'round':

                    unit = Decimal(trans_args[0]) if len(trans_args) > 0 else Decimal('1')
                    val = round(val, unit, ROUND_HALF_EVEN)
                    # val = val / unit
                    # val = val.quantize(Decimal('1'), context=Context(rounding=ROUND_HALF_EVEN))
                    # val = val * unit
                    # # turn -0 into 0 and 1.00 into 1
                    # val = Decimal('0') if val.is_zero() else val.normalize()
                    continue

                if trans_name == 'roundup':
                    unit = Decimal(trans_args[0]) if len(trans_args) > 0 else Decimal('1')
                    val = round(val, unit, ROUND_UP)
                    continue

                if trans_name == 'rounddown':
                    unit = Decimal(trans_args[0]) if len(trans_args) > 0 else Decimal('1')
                    val = val = round(val, unit, ROUND_DOWN)
                    continue

                if trans_name == 'plural':
                    plural_part = trans_args[0] if len(trans_args) > 0 else 's'
                    single_part = trans_args[1] if len(trans_args) > 1 else ''
                    if val == 1:
                        val = single_part
                    else:
                        val = plural_part
                    continue

                if trans_name == 'change':
                    up   = trans_args[0] if len(trans_args) > 0 else 'increase'
                    down = trans_args[1] if len(trans_args) > 1 else 'decrease'
                    none = trans_args[2] if len(trans_args) > 2 else 'change'
                    if val > 0:
                        val = up
                    elif val < 0:
                        val = down
                    else:
                        val = none
                    continue

                raise Exception('transformation "%s" is not implemented.' % trans_name)

                # loop repeats for each transform

            if isinstance(val, Decimal):
                val = val.normalize()      # turns 1.00 into 1
                val = '{0:f}'.format(val)  # turns 1E+1 into 10
            return str(val)

        except:
            return match.group(0)












#
