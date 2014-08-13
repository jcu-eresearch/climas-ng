
from prosemaker import ProseMaker

class DocParser(object):

    def test(self):

        pm = ProseMaker()

        pm.data = {
            'a': 'asdf',
            'b': 'bsdf'
        }

        pm.source = "test [[never]]this is hidden![[always]]this shows"

        return pm.doc