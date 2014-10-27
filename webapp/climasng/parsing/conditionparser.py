
from parsimonious.grammar import Grammar
from parsimonious.nodes import *
from decimal import Decimal

# ===================================================================
class Percentage(Decimal):
    pass
# ===================================================================
class ConditionVisitor(NodeVisitor):

    def __init__(self, data={}):
        self._data = data

    ## data ---------------------------------------------------------
    @property
    def data(self):
        """ The 'data' property """
        return self._data

    @data.setter
    def data(self, value):
        self._data = value
        return self._data

    @data.deleter
    def data(self):
        del self._data

    # throwaway node handler ----------------------------------------
    def generic_visit(self, node, children):
        if len(children) == 1:
            return children[0]
        else:
            return node.text.strip()

    # proper node handlers ------------------------------------------

    def visit_disjunction(self, node, (firstterm, otherterms)):
        terms = [firstterm]
        if len(otherterms) > 0:
            terms.extend(otherterms)
        return any(terms)


    def visit_moreorconjunctions(self, node, terms):
        return terms


    def visit_orconjunction(self, node, (ws1, operator, ws2, conjunction)):
        return conjunction


    def visit_conjunction(self, node, (firstterm, otherterms)):
        terms = [firstterm]
        if len(otherterms) > 0:
            terms.extend(otherterms)
        return all(terms)


    def visit_moreandconditions(self, node, terms):
        return terms


    def visit_andcondition(self, node, (ws1, operator, ws2, simplecondition)):
        return simplecondition


    def visit_simplecondition(self, node, children):
        return children[0]


    def visit_always(self, node, children):
        return True


    def visit_never(self, node, children):
        return False


    def visit_value(self, node, children):
        # should be already resolved to a real value
        return children[0]


    def visit_numeric(self, node, children):
        return Decimal(node.text)


    def visit_percentage(self, node, children):
        return Percentage(children[0])


    def visit_varname(self, node, children):
        if node.text in self._data:
            # the varname they specified is known to us..
            return self._data[node.text]
        # otherwise except out
        raise Exception("Unknown variable name: '" + node.text + "'")


    def visit_range(self, node, children):
        if isinstance(children[0], Percentage):
            return children[0]
        else:
            return abs(children[0])


    def visit_comparison(self, node, children):
        return children[0]


    def visit_simple_comparison(self, node, (left, ws1, comp, ws2, right)):
        if comp ==      '==':
            return (left == right)

        if comp ==      '!=':
            return (left != right)

        if comp ==      '>=':
            return (left >= right)

        if comp ==      '>':
            return (left > right)

        if comp ==      '<=':
            return (left <= right)

        if comp ==      '<':
            return (left < right)

        raise Exception('comparison "' + comp + '" is not implemented')


    def visit_range_muchlessthan_comparison(self, node, (left, ws1, pre, range, post, ws2, right)):
        if isinstance(range, Percentage):
            range = right * range / Decimal(100)

        left_max = right - range
        return (left < left_max)


    def visit_range_leftrocket_comparison(self, node, (left, ws1, pre, range, post, ws2, right)):
        if isinstance(range, Percentage):
            range = right * range / Decimal(100)

        left_min = right - range
        left_max = right
        return (left_min <= left < left_max)


    def visit_range_eq_comparison(self, node, (left, ws1, pre, range, post, ws2, right)):
        if isinstance(range, Percentage):
            range = right * range / Decimal(100)

        left_min = right - range
        left_max = right + range
        return (left_min <= left <= left_max)


    def visit_range_neq_comparison(self, node, (left, ws1, pre, range, post, ws2, right)):
        if isinstance(range, Percentage):
            range = right * range / Decimal(100)

        left_min = right - range
        left_max = right + range
        return not(left_min <= left <= left_max)


    def visit_range_rightrocket_comparison(self, node, (left, ws1, pre, range, post, ws2, right)):
        if isinstance(range, Percentage):
            range = right * range / Decimal(100)

        left_min = right
        left_max = right + range
        return (left_min < left <= left_max)


    def visit_range_muchgreaterthan_comparison(self, node, (left, ws1, pre, range, post, ws2, right)):
        if isinstance(range, Percentage):
            range = right * range / Decimal(100)

        left_min = right + range
        return (left > left_min)


    def visit_simple_comparator(self, node, (cmp)):
        return cmp[0]


    def visit_expression(self, node, (left, ws1, operator, ws2, right)):

        if not isinstance(left, Decimal):
            left = Decimal(repr(left))

        if not isinstance(right, Decimal):
            right = Decimal(repr(right))

        if operator ==  '+':
            return (left + right)

        if operator ==  '-':
            return (left - right)

        if operator ==  '*':
            return (left * right)

        if operator ==  '/':
            return (left / right)

        raise Exception('operator "' + operator + '" is not implemented')


# ===================================================================
class ConditionParser(object):

    def __init__(self, condition="always", data={}):
        self._condition = condition
        self._data = data

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

    ## data ---------------------------------------------------------
    @property
    def data(self):
        """ The 'data' property """
        return self._data

    @data.setter
    def data(self, value):
        self._data = value
        return self._data

    @data.deleter
    def data(self):
        del self._data

    ## result -------------------------------------------------------
    @property
    def result(self):
        """ The 'result' property """

        g = Grammar("""

            disjunction = conjunction moreorconjunctions
            moreorconjunctions = orconjunction*
            orconjunction = rws op_or rws conjunction

            conjunction = simplecondition moreandconditions
            moreandconditions = andcondition*
            andcondition = rws op_and rws simplecondition

            simplecondition = always / never / comparison

            op_or = ~"or"i
            op_and = ~"and"i

            ws = ~"\s*"
            rws = ~"\s+"

            never = ~"never"i
            always = ~"always"i

            value = expression / numeric / varname

            numeric = ~"[+-]?\d+(\.\d+)?"
            varname = ~"[a-z_][a-z0-9_]*"i

            expression = term rws operator rws term
            term = numeric / varname

            operator = plus / minus / times / divide
            plus = "+"
            minus = "-"
            times = "*"
            divide = "/"

            range = percentage / numeric

            percentage = numeric percent_sign
            percent_sign = "%"

            comparison = range_eq_comparison / range_neq_comparison / range_leftrocket_comparison / range_rightrocket_comparison / range_muchlessthan_comparison / range_muchgreaterthan_comparison / simple_comparison

            simple_comparison = value ws simple_comparator ws value

            simple_comparator = cmp_eq / cmp_neq / cmp_gte / cmp_gt / cmp_lte / cmp_lt
            cmp_eq = "=="
            cmp_neq = "!="
            cmp_gte = ">="
            cmp_gt = ">"
            cmp_lte = "<="
            cmp_lt = "<"

            range_muchlessthan_comparison = value ws range_lt_prev range range_lt_post ws value
            range_lt_prev = "<"
            range_lt_post = "<"

            range_leftrocket_comparison = value ws range_lr_prev range range_lr_post ws value
            range_lr_prev = "<"
            range_lr_post = "="

            range_eq_comparison = value ws range_eq_prev range range_eq_post ws value
            range_eq_prev = "="
            range_eq_post = "="

            range_neq_comparison = value ws range_neq_prev range range_neq_post ws value
            range_neq_prev = ">"
            range_neq_post = "<"

            range_rightrocket_comparison = value ws range_rr_prev range range_rr_post ws value
            range_rr_prev = "="
            range_rr_post = ">"

            range_muchgreaterthan_comparison = value ws range_gt_prev range range_gt_post ws value
            range_gt_prev = ">"
            range_gt_post = ">"
        """)

        tree = g.parse(self._condition)

        # print("\n----\n")
        # print(repr(tree))
        # print("\n----\n")

        v = ConditionVisitor(self.data)

        return v.visit(tree)
