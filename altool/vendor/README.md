# Bundled YAML runtime

Altool ships the unmodified pure-Python files from **PyYAML 6.0.3** under `pyyaml/`.
Source: https://github.com/yaml/pyyaml/tree/6.0.3/lib/yaml
License: MIT, retained in `pyyaml/LICENSE`.

`pyyaml-manifest.json` records the shipped source hashes and version. Optional
`cyaml.py` and compiled extensions are omitted; the upstream import falls back
to pure Python. `standards.py` loads this package under `_altool_pyyaml`, without
changing sys.path or depending on the user's installed `yaml` module.

To update the product dependency, review the upstream release, replace the pure
Python files and license without local parser patches, regenerate the manifest,
and run all tests, `python3 -S altool/scripts/standards.py validate`, and fresh
installation tests with no site packages. Include security/license review in
the product release. End users do not install or update this dependency.
