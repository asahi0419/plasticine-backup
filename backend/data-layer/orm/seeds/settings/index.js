import THEMES from './themes.js';
import * as EXTENSIONS from '../../../../extensions/index.js';

export default [
  {
    group: 'core',
    name: 'Mailer',
    alias: 'mailer',
    value: {
      outgoing: {
        enabled: true,
        host: '95.217.39.43',
        port: 25,
        secure: false,
        auth: {
          user: process.env.APP_MAILER_USER,
          pass: process.env.APP_MAILER_PASS,
        },
        tls: {rejectUnauthorized: false},
        from: {
          name: '-- CO2SANDBOX.NASC.SPACE --',
          address: 'co2sandbox@nasc.space',
        },
        send_interval_ms: 1000,
        type: 'smtp',
      },
      incoming: {
        auth: {
          pass: process.env.APP_MAILER_PASS,
          user: process.env.APP_MAILER_USER,
        },
        type: 'pop',
        enabled: false,
        tls: { rejectUnauthorized: false },
        port: 995,
        host: 'pop.gmail.com',
        secure: true,
        open_connection_timeout_ms: 60000,
        read_interval_ms: 60000,
      },
    },
    description: 'Email sender settings',
  },
  {
    group: 'core',
    name: 'Session',
    alias: 'session',
    value: {
      multisession: true,
      autologout_after_idle_min: 5,
    },
    description: 'Allow working for many people with one account simultaneously',
  },
  {
    group: 'core',
    name: 'Data store periods',
    alias: 'data_store_periods',
    value: {
      sessions_days: 3,
      cache: { view: { map: 48 } },
      del_recs_not_inserted_after_days: 3,
      del_log_web_after_days: 5,
      del_log_background_after_days: 3,
      del_log_mc_days: 5,
      activity_log_keep_days: 90,
      del_planned_task_after_days: 5,
      del_mails_unrelated_after_days: 5,
      del_attachments_unrelated_after_days: 3,
      del_recs_mc_sync_after_days: 3,
      del_recs_audit_after_days: { main_model_alias: 90 },
    },
    description: 'Settings to define store period of different system logs',
  },
  {
    group: 'core',
    name: 'Start URL',
    alias: 'start_url',
    value: '/pages/login',
    description: 'The start page URL',
  },
  {
    group: 'core',
    name: 'Themes',
    alias: 'themes',
    value: THEMES,
    description: 'System themes',
  },
  {
    group: 'core',
    name: 'Limits',
    alias: 'limits',
    value: {
      chart: 10000,
      map: 10000,
      lookup_max_ref_obj_search: 10,
      lookup_min_symb_search: 3,
      rtl_select_field: 100,
      query_iterator_max: 10000,
      query_iterator: 1000,
      export_records_max: 10000,
      export_records_docx_pdf_max: 500,
      export_form_photos_max: 100,
      topology_view_nodes_max: 10000,
    },
    description: 'Limit the number of returning records',
  },
  {
    group: 'core',
    name: 'Home page',
    alias: 'home_page',
    value: '',
    description: 'The default home page after user login (in case the Home page of user is not predefined)',
  },
  {
    group: 'core',
    name: 'Project name',
    alias: 'project_name',
    value: 'Streamline',
    description: 'The name of the project',
  },
  {
    group: 'core',
    name: 'Authorization',
    alias: 'authorization',
    value: {
      '2fa': 'off',
      system_expire_protection_light: '',
      allow_registration: false,
      password: {
        recovery: true,
        min_length: 8,
        max_length: 24,
        expired_time: 0
      },
      codegen_length: 6,
      brute_protect: {
        account: {
          ban: false,
          attempts: 5,
          duration: 60,
          by_levels: false
        },
        ip: {
          ban: true,
          attempts: 3,
          duration: 60,
          by_levels: true
        },
      },
      social_network: {
        enabled: false,
        providers: [ 'facebook', 'google', 'twitter', 'linkedin' ],
        oneall_auth_site_subdomain: 'please_specify',
        oneall_auth_site_public_key: 'please_specify',
        oneall_autoneall_auth_site_private_key: 'please_specify',
      },
      service_account_button: {
        enabled: false,
        name: 'Service account',
        icon: 'user',
      },
      sso: {
        create_user_if_no_exist: false,
        create_user_if_no_exist_with_group: [ '__public' ],
        strategies: {
          azure: {
            enabled: false,
            name: 'Log in with Azure',
            icon: 'windows',
            params: {
              identityMetadata: 'please_specify',
              clientID: 'please_specify',
            },
          },
          google: {
            enabled: false,
            name: 'Log in with Google',
            icon: 'google',
            params: {
              clientID: 'please_specify',
            },
          },
          custom: {
            enabled: false,
            name: 'Log in over SSO',
            icon: 'lock',
            params: {
              clientID: 'please_specify',
              getCodeUrl: 'please_specify',
              getTokenUrl: 'please_specify',
            },
          },
          custom_saml2: {
            enabled: false,
            name: 'Log in over SSO SAML2',
            icon: 'lock',
            params: {
              entryPoint: 'please_specify',
              cert: 'please_specify',
            },
          },
        },
      },
    },
    description: 'Authorization settings',
  },
  {
    group: 'core',
    name: 'Mobile Client',
    alias: 'mc',
    value: {
      tracking_interval: 900,
      gps_force_on: true,
      agps_force_on: true,
      forbid_fake_gps: true,
      normalGpsUpdateTime: 60,
      gpsDistance: 100,
      expirationDuration: 60,
      save_photo_orig_size: true,
      login_text: 'Hello, hello, hello! Hello, friends, hello! Hello - Hi! Hello - Hi! Hooray! Hello - Hi! Hooray! Hello - Hi! Please, send all reports, because you can lose data!',
      co_update_interval: 15,
      tracking_latitude: 49.99459,
      tracking_longitude: 36.20954,
      custom_record_update_interval: 15,
      co_sync: 11,
      number_of_attempts: 3,
      co_limit_records_for_single_packet: 10,
      co_date_time_format: 'YYYY/DD/MM mm:HH:ss',
      allow_to_change_search_settings: false,
      number_of_chars_to_perform_search: 2,
      input_delay_to_perform_search: 4,
      custom_record_journal_update_interval: 15,
      custom_record_background_update_interval: 0,
      packet_size: 100,
      co_filtering: true,
      max_file_size_upload: 35,
      custom_sync_records_limit: 1000,
      co_engine: '2.0',
      radius: 500,
      gps_fresh_fix: {
        radius: 100,
        latitude: 48.4323,
        longtitude: 35.00145
      },
      model_sync_exclude: ['map_view_cache'],
      auto_update_version_code_android: '',
      auto_update_version_name_android: '',
      auto_update_version_code_ios: '',
      auto_update_version_name_ios: '',
      default_imei_activation: false,
      default_imei_value: '',
      store_period_map_cache_view: 48,
      var_types: {
        'integer': {
          'type': 'bigint',
          'range': [-9223372036854778, 9223372036854778]
        },
      },
    },
    description: 'Defines settings fo the mobile client',
  },
  {
    group: 'core',
    name: 'Hidden paginator query limit',
    alias: 'hidden_paginator_query_limit',
    value: 250,
    description: 'This limit will be applied in case paginator on view has been hidden',
  },
  {
    group: 'core',
    name: 'Attachments',
    alias: 'attachments_settings',
    value: {
      allowed_formats: [ 'flv', 'avi', 'mp4', 'mp3', 'png', 'jpg', 'gif', 'bmp', 'psd', 'doc', 'docx', 'csv', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'rar', 'zip', 'zipx', 'kmz', 'pem', 'wav', 'kml' ],
    },
    description: 'To be able to manage settings of attachment feature',
  },
  {
    group: 'core',
    name: 'Extensions',
    alias: 'extensions',
    value: EXTENSIONS.getSetting({ plugins: EXTENSIONS.config.plugins }),
    description: 'This project extensions',
  },
  {
    group: 'core',
    name: 'Timeout',
    alias: 'timeout',
    value: {
      default: 2500,
      action: 2500,
      db_rule: 2500,
      escalation_rule: 30000,
      web_service: 15000,
      web_socket: 5000,
    },
    description: 'Timeouts for scripts execution',
  },
  {
    group: 'core',
    name: 'BashWebAPI',
    alias: 'bash_web_api',
    value: {
      host: '',
      port: '',
      user_id: '',
    },
    description: 'Bash Web API settings',
  },
  {
    group: 'core',
    name: 'Logs',
    alias: 'logs',
    value: {
      transaction_logs_on: false,
      log_min_time: 100,
      use_production_logs: false,
    },
    description: 'Defines params related to logs',
  },
  {
    group: 'core',
    name: 'Security',
    alias: 'security',
    value: {
      iframe: false,
      new_account_expired: false,
    },
    description: 'Defines security params',
  },
  {
    group: 'core',
    name: 'Decoration',
    alias: 'decoration',
    value: {
      form: {
        field: {
          hint: {
            icon: null
          }
        }
      }
    },
    description: 'Controls decoration of components like forms etc',
  },
  {
    group: 'core',
    name: 'Tutorial',
    alias: 'tutorial',
    value: {
      path: null,
    },
    description: 'Defines the system tutorial parameters'
  },
  {
    group: 'core',
    name: 'Format',
    alias: 'format',
    value: {
      field_date_time: 'YYYY-MM-DD HH:mm:ss',
      field_date_notime: 'YYYY-MM-DD'
    },
    description: 'Defines the system default formats'
  },
];
