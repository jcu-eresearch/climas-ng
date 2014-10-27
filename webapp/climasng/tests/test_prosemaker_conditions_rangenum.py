import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerConditions(ProseMakerTestCase):

    # ------------------------------------------------------- test --
    def test_pm_condition_rangeequality_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[10 =2= 11]]showing',
                            '[[11 =2= 10]]showing',
                            '[[10 =5= 6]]showing',
                            '[[1.0 =0.1= 1.1]]showing',
                            '[[1 =0= 1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[10 =3= 6]]hiding',
                            '[[6 =3= 10]]hiding',
                            '[[1 =0= 1.01]]hiding',
                            '[[1 =0.1= 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeequality_litnumpercent_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[1 =15%= 1.1]]showing',
                            '[[10 =15%= 11]]showing',
                            '[[1000 =15%= 1100]]showing',
                            '[[79 =25%= 100]]showing',
                            '[[1234 =1%= 1236]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[10 =10%= 6]]hiding',
                            '[[100 =25%= 79]]hiding',
                            '[[1.01 =10%= 10]]hiding',
                            '[[99.5 =0.1%= 100]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeequality_varnum_comparison(self):
        self.pm.data = { 'one': 1, 'two': 2, 'aten': 10 }
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[aten =2= 11]]showing',
                            '[[11 =2= aten]]showing',
                            '[[aten =5= 6]]showing',
                            '[[1 =0= one]]showing'
            ],
            # all these docs should result in ''
            '':         [   '[[aten =3= 6]]hiding',
                            '[[6 =3= aten]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeinequality_varnum_comparison(self):
        self.pm.data = { 'one': 1, 'two': 2, 'aten': 10 }
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[aten >3< 6]]showing',
                            '[[6 >3< aten]]showing'
            ],
            # all these docs should result in ''
            '':         [   '[[aten >2< 11]]hiding',
                            '[[11 >2< aten]]hiding',
                            '[[aten >5< 6]]hiding',
                            '[[1 >0< one]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeleftrocket_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[10 <2= 11]]showing',
                            '[[6 <5= 10]]showing',
                            '[[1.0 <0.1= 1.1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[10 <3= 6]]hiding',
                            '[[1 <0= 1]]hiding',
                            '[[10 <5= 6]]hiding',
                            '[[11 <2= 10]]hiding',
                            '[[6 <3= 10]]hiding',
                            '[[1 <0= 1.01]]hiding',
                            '[[1 <0.1= 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeleftrocket_varnum_comparison(self):
        self.pm.data = { 'one': 1, 'two': 2, 'aten': 10 }
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[aten <2= 11]]showing',
                            '[[6 <5= aten]]showing',
                            '[[one <0.1= 1.1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[aten <3= 6]]hiding',
                            '[[one <0= one]]hiding',
                            '[[aten <5= 6]]hiding',
                            '[[11 <2= aten]]hiding',
                            '[[6 <3= aten]]hiding',
                            '[[one <0.1= 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangerightrocket_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[11 =2> 10]]showing',
                            '[[10 =5> 6]]showing',
                            '[[1.1 =0.1> 1.0]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[6 =3> 10]]hiding',
                            '[[1 =0> 1]]hiding',
                            '[[6 =5> 10]]hiding',
                            '[[10 =2> 11]]hiding',
                            '[[10 =3> 6]]hiding',
                            '[[1.01 =0> 1]]hiding',
                            '[[1.2 =0.1> 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)

    # ------------------------------------------------------- test --
    def test_pm_condition_rangemuchlessthan_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[6 <3< 10]]showing',
                            '[[1.0 <0.1< 1.101]]showing',
                            '[[1.0 <0.1< 1.2]]showing',
                            '[[0.99 <0< 1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1.01 <0.1< 1.1]]hiding',
                            '[[1 <0.1< 1.1]]hiding',
                            '[[6 <5< 10]]hiding',
                            '[[1 <0< 1]]hiding',
                            '[[1 <1< 0.99]]hiding',
                            '[[10 <2< 11]]hiding',
                            '[[1.01 <0< 1]]hiding',
                            '[[1.2 <0.1< 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)

    # ------------------------------------------------------- test --
    def test_pm_condition_rangemuchgreaterthan_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[10 >3> 6]]showing',
                            '[[1.101 >0.1> 1.0]]showing',
                            '[[1.2 >0.1> 1.0]]showing',
                            '[[1 >0> 0.99]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1.1 >0.1> 1.01]]hiding',
                            '[[1.1 >0.1> 1]]hiding',
                            '[[10 >5> 6]]hiding',
                            '[[1 >0> 1]]hiding',
                            '[[0.99 >1> 1]]hiding',
                            '[[11 >2> 10]]hiding',
                            '[[1 >0> 1.01]]hiding',
                            '[[1 >0.1> 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)

# ===================================================================
