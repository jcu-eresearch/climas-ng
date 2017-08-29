import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.md')) as f:
    README = f.read()

install_reqs = [
    'pyramid',
    'pyramid_chameleon',
    'pyramid_debugtoolbar',
    'pyramid_tm',
    'SQLAlchemy',
    'transaction',
    'zope.sqlalchemy',
    'waitress',
    'parsimonious',
    'coverage',
    'simplejson',
    'pypandoc==0.8.3',
    'whoosh',
    'requests'
]

setup_reqs = [
    'setuptools-git'
]

setup(name='climas-ng',
      version='0.0',
      description='CliMAS Next Generation - biodiversity and climate in Australia',
      long_description=README,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='Daniel Baird',
      author_email='daniel@danielbaird.com',
      url='',
      keywords='web wsgi bfg pylons pyramid',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='climasng.tests',
      install_requires=install_reqs,
      setup_requires=setup_reqs,
      entry_points="""\
      [paste.app_factory]
      main = climasng:main
      [console_scripts]
      initialize_climas-ng_db = climasng.scripts.initializedb:main
      """,
      )
