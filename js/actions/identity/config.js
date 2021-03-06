import PropTypes from 'prop-types';
import { createAction } from 'redux-actions';
import _ from 'lodash';
import Promise from 'bluebird';

import { generateNewKeys } from 'utility';
import { loadState } from 'js/local-storage';

import { importUsers } from 'actions/data/users';

export const SET_ALIAS = 'identity/config/SET_ALIAS';
export const SET_URL_FOR_RELAY = 'identity/config/SET_URL_FOR_RELAY';
export const SET_KEYS = 'identity/config/SET_KEYS';
export const SET_UID = 'identity/config/SET_UID';
export const SET_CONFIG = 'identity/config/SET_CONFIG';
export const REGENERATE_UID = 'identity/config/REGENERATE_UID';
export const REGENERATE_KEYS = 'identity/config/REGENERATE_KEYS';
export const IMPORT_SETTINGS_BEGIN = 'identity/config/IMPORT_SETTINGS_BEGIN';
export const IMPORT_SETTINGS_SUCCESS = 'identity/config/IMPORT_SETTINGS_SUCCESS';
export const IMPORT_SETTINGS_FAILURE = 'identity/config/IMPORT_SETTINGS_FAILURE';

export const setAlias = createAction(SET_ALIAS);
export const setUrlForRelay = createAction(SET_URL_FOR_RELAY);
export const setKeys = createAction(SET_KEYS);
export const setUid = createAction(SET_UID);
export const setConfig = createAction(SET_CONFIG);
export const importSettingsBegin = createAction(IMPORT_SETTINGS_BEGIN);
export const importSettingsSuccess = createAction(IMPORT_SETTINGS_SUCCESS);
export const importSettingsFailure = createAction(IMPORT_SETTINGS_FAILURE);

export function importSettings(settings) {
  return dispatch => {
    dispatch(importSettingsBegin());
    let settingsObject = settings;

    if (typeof settings === 'string') {
      try {
        settingsObject = JSON.parse(settings);
      } catch (e) {
        dispatch(importSettingsFailure(e));

        return Promise.reject(e.message);
      }
    }

    dispatch(setConfig(settingsObject.config));
    dispatch(importUsers(settingsObject.members || []));

    dispatch(importSettingsSuccess());

    return Promise.resolve();
  };
}

export function regenerateUid() {
  return dispatch => {
    const newUid = Math.random().toString(16).slice(2) +
      Math.random().toString(16).slice(2);

    dispatch(setUid(newUid));
    return Promise.resolve();
  };
}

export function regenerateKeys() {
  return dispatch => {
    const algorithm = 'nacl';
    const keys = generateNewKeys();

    dispatch(setKeys({ algorithm, ...keys }));

    return Promise.resolve(keys);
  };
}

export const configPropTypes = {
  alias: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  publicKey: PropTypes.string.isRequired,
  privateKey: PropTypes.string.isRequired,
  relays: PropTypes.array.isRequired
};

export function isConfigValid(config) {
  const result = !(
    _.isEmpty(config.alias) ||
    _.isEmpty(config.uid) ||
    _.isEmpty(config.publicKey) ||
    _.isEmpty(config.privateKey) ||
    _.isEmpty(config.relays)
  );

  return result;
}

export function isStoredConfigValid() {
  const state = loadState() || {};
  const identity = state.identity || {};
  const config = identity.config || {};

  return isConfigValid(config);
}
