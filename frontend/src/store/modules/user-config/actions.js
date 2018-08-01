import {
    SET_USER_CONFIG,
    UPDATE_USER_CONFIG,
    SET_METAMASK_ADDRESS,
    SET_USERNAME,
    CHECK_USERNAME_EXISTENCE,
    EDIT_PROFILE,
    MUTATE_METAMASK_ADDRESS,
    MUTATE_USERNAME,
    MUTATE_USERNAME_EXISTENCE,
    MUTATE_EDIT_PROFILE_RESULT
} from './types';

import { getAccounts } from 'scripts/helpers';
import { getUsername, usernameExists, registerUser } from 'services/ethereumService';

export default {
    [SET_METAMASK_ADDRESS]: async ({ commit }) => {
        let metamaskAddress = await getAccounts();
        commit(MUTATE_METAMASK_ADDRESS, metamaskAddress);
    },
    [SET_USERNAME]: async ({ commit, state }) => {
        let username = await getUsername(state.metamaskAddress);
        if (username !== '') {
            commit(MUTATE_USERNAME, username);
        } else {
            let username = 'Anon';
            commit(MUTATE_USERNAME, username);
        }
    },
    [SET_USER_CONFIG]: async ({ dispatch }) => {
        await dispatch(SET_METAMASK_ADDRESS);
        await dispatch(SET_USERNAME);
    },
    [UPDATE_USER_CONFIG]: async ({ dispatch, state }) => {
        setInterval(async function() {
            let changedMetamaskAddress = await getAccounts();
            if (changedMetamaskAddress !== state.metamaskAddress) {
                dispatch(SET_USER_CONFIG);
            }
        }, 1000)
        return true;
    },
    [CHECK_USERNAME_EXISTENCE]: async ({ commit, state }, newUsername) => {
        let isExisting = await usernameExists(newUsername);
        if (newUsername !== state.username && newUsername !== '') {
            commit(MUTATE_USERNAME_EXISTENCE, isExisting);             
        } else if (newUsername === '') {
            let isExisting = false;
            commit(MUTATE_USERNAME_EXISTENCE, isExisting)
        }
    },
    [EDIT_PROFILE]: async ({ commit, dispatch, state }, newUsername, hashToProfilePicture) => {
        await dispatch(CHECK_USERNAME_EXISTENCE, newUsername);
        if (!state.changeUsername.isExisting) {
            if (newUsername === '') {
                newUsername = state.username;
            }
            console.log(newUsername);
            await registerUser(newUsername, '0x00000000000000000000000000000000', state.metamaskAddress);
            let result = true;
            commit(MUTATE_EDIT_PROFILE_RESULT, result);
            await dispatch(SET_USER_CONFIG);
            setTimeout(() => commit(MUTATE_EDIT_PROFILE_RESULT, !result), 10000)
        } else {
            let result = false;
            commit(MUTATE_EDIT_PROFILE_RESULT, result);
        }
    }
};