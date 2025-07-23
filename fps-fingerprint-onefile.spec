# -*- mode: python ; coding: utf-8 -*-
# One-file version - creates a single executable

block_cipher = None

a = Analysis(
    ['src/tool/app.py'],
    pathex=['src'],
    binaries=[],
    datas=[
        ('src/tool/config', 'config'),
        ('src/tool/fps_test', 'fps_test'),
        ('src/tool/utils', 'utils'),
    ],
    hiddenimports=[
        'selenium',
        'webdriver_manager',
        'requests',
        'beautifulsoup4',
        'fps_test',
        'config',
        'utils',
        'fps_test.test_executor',
        'fps_test.attribute_tests.language_tests',
        'fps_test.attribute_tests.user_agent_tests',
        'fps_test.login_tests.cross_browser_login_tests',
        'config.env_config',
        'config.general_config',
        'config.language_config',
        'config.timezone_config',
        'config.user_agent_config',
        'utils.browser_factory',
        'utils.fingerprint_collector',
        'utils.login_helper',
        'utils.test_utils',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='fps-fingerprint-onefile',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
