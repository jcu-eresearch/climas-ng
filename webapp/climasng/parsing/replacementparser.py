
from parsimonious.grammar import Grammar
from parsimonious.nodes import *

from decimal import Decimal

# ===================================================================
class ReplacementVisitor(NodeVisitor):

    def __init__(self, data={}):
        self._data = data

    # default node handler ------------------------------------------
    def generic_visit(self, node, children):
        if len(children) == 1:
            return children[0]
        else:
            return node.text.strip()

    # proper node handlers ------------------------------------------
    def visit_replacement(self, node, (ws1, replacevalue, translist, ws2)):
        return [replacevalue, translist]

    def visit_transformationlist(self, node, translist):
        return translist

    def visit_transformation(self, node, (ws1, comma, ws2, transname, transarglist)):
        return [transname, transarglist]

    def visit_transarglist(self, node, children):
        return children

    def visit_varname(self, node, children):
        if node.text in self._data:
            return (self._data[node.text])

        raise Exception('variable name "' + node.text + '" was not found.')

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

    def visit_numberliteral(self, node, children):
        return Decimal(node.text.strip())

    def visit_doublequotedstr(self, node, (ws, q1, arg, q2)):
        return arg

    def visit_singlequotedstr(self, node, (ws, q1, arg, q2)):
        return arg

    def visit_unquotedarg(self, node, (ws, arg)):
        return arg

# ===================================================================
class ReplacementParser(object):

    def __init__(self, replacement='', data={}):
        self._replacement = replacement
        self._data = data

    ## replacement --------------------------------------------------
    @property
    def replacement(self):
        """ The 'replacement' property """
        return self._replacement

    @replacement.setter
    def replacement(self, value):
        self._replacement = value
        return self._replacement

    @replacement.deleter
    def replacement(self):
        del self._replacement

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
            replacement = ws replacevalue transformationlist ws

            replacevalue = expression / varname / literal

            transformationlist = transformation*
            transformation = ws comma ws transname transarglist

            transarglist = transarg*
            transarg = singlequotedstr / doublequotedstr / unquotedarg

            expression = term rws operator rws term

            term = numberliteral / varname

            varname = ~"[a-z_][a-z0-9_]*"i
            transname = ~"[a-z_][a-z0-9_]*"i

            literal = numberliteral / stringliteral
            numberliteral = ~"(\+|-)?\d+([.]\d+)?"
            stringliteral = singlequotedstr / doublequotedstr

            doublequotedstr = ws dblq notdblq dblq
            singlequotedstr = ws sngq notsngq sngq
            unquotedarg = ws notwsorcomma

            operator = plus / minus / times / divide

            plus = "+"
            minus = "-"
            times = "*"
            divide = "/"

            rws = ~"\s+"
            ws = ~"\s*"
            comma = ","
            notwsorcomma = ~"[^\s,]+"

            dblq = "\\""
            notdblq = ~"[^\\"]*"

            sngq = "'"
            notsngq = ~"[^']*"
        """)

        tree = g.parse(self._replacement)

        return ReplacementVisitor(self._data).visit(tree)
