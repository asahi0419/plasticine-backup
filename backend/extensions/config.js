export default {
  plugins: {
    plugin_telegram: {
      active: process.env.EXT_PLUGIN_TELEGRAM_ACTIVE || false,
      install: process.env.EXT_PLUGIN_TELEGRAM_INSTALL || true
    },
    plugin_inventory: {
      active: process.env.EXT_PLUGIN_INVENTORY_ACTIVE || false,
      install: process.env.EXT_PLUGIN_INVENTORY_INSTALL || true
    },
    plugin_odbc: {
      active: process.env.EXT_PLUGIN_ODBC_ACTIVE || false,
      install: process.env.EXT_PLUGIN_ODBC_INSTALL || true
    },
    plugin_fts: {
      active: process.env.EXT_PLUGIN_FTS_ACTIVE || false,
      install: process.env.EXT_PLUGIN_FTS_INSTALL || true
    },
    plugin_sso_server: {
      active: process.env.EXT_PLUGIN_SSO_SERVER_ACTIVE || false,
      install: process.env.EXT_PLUGIN_SSO_SERVER_INSTALL || true
    },
    plugin_psql: {
      active: process.env.EXT_PLUGIN_PSQL_ACTIVE || false,
      install: process.env.EXT_PLUGIN_PSQL_INSTALL || true
    },
    plugin_firebase: {
      active: process.env.EXT_PLUGIN_FIREBASE_ACTIVE || false,
      install: process.env.EXT_PLUGIN_FIREBASE_INSTALL || true
    },
  },
  adaptors: {
    adaptor_sl_table_resolver: {
      active: process.env.EXT_ADAPTOR_SL_TABLE_RESOLVER_ACTIVE || false,
      install: process.env.EXT_ADAPTOR_SL_TABLE_RESOLVER_INSTALL || false
    },
    adaptor_sl_password_encryptor: {
      active: process.env.EXT_ADAPTOR_SL_PASSWORD_ENCRYPTOR_ACTIVE || false,
      install: process.env.EXT_ADAPTOR_SL_PASSWORD_ENCRYPTOR_INSTALL || false
    }
  },
  migrators: {
    migrator_sl_to_sl2: {
      active: process.env.EXT_MIGRATOR_SL_TO_SL2_ACTIVE || false,
      install: process.env.EXT_MIGRATOR_SL_TO_SL2_INSTALL || false
    }
  }
};
