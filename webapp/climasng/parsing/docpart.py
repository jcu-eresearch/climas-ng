class DocPart(object):

    def __init__(self, block=None):
        self._content = ''
        self._condition = 'always'

        if block:
            self.parse(block)

    ## content ------------------------------------------------------
    @property
    def content(self):
        """ The 'content' property """
        return self._content

    @content.setter
    def content(self, value):
        self._content = value
        return self._content

    @content.deleter
    def content(self):
        del self._content

    ## condition ----------------------------------------------------
    @property
    def condition(self):
        """ The 'condition' property """
        return self._condition

    @condition.setter
    def condition(self, value):
        self._condition = value
        return self._condition

    @condition.deleter
    def condition(self):
        del self._condition
    # ---------------------------------------------------------------
    def parse(self, block):
        """ Parses a string block that might start with a condition """

        # maybe it starts with [[, but it doesn't have to (it's implied)
        if block[0:2] == '[[':
            block = block[2:]

        block_bits = block.split(r']]')

        # the last bit is the content
        self._content = block_bits[-1]

        # if there's more than one bit, the first bit is the condition
        if len(block_bits) > 1:
            self._condition = block_bits[0].strip()
        else:
            self._condition = 'always'
