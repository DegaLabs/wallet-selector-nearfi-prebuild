'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isMobile = require('is-mobile');
var core = require('@near-wallet-selector/core');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const isInstalled = () => {
  return core.waitFor(() => {
    var _a;

    return !!((_a = window.nearFiWallet) === null || _a === void 0 ? void 0 : _a.isNearFi);
  }).catch(() => false);
};

const setupNearFiState = () => {
  const wallet = window.nearFiWallet;
  return {
    wallet
  };
};

const NearFi = ({
  options,
  metadata,
  store,
  emitter,
  logger
}) => __awaiter(void 0, void 0, void 0, function* () {
  const _state = setupNearFiState();

  const signOut = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!_state.wallet.isSignedIn()) {
      return;
    }

    const res = yield _state.wallet.signOut();

    if (res === true) {
      return;
    }

    const error = new Error(typeof res.error === "string" ? res.error : res.error.type); // Prevent signing out by throwing.

    if (error.message === "User reject") {
      throw error;
    } // Continue signing out but log the issue.


    logger.log("Failed to sign out");
    logger.error(error);
  });

  const setupEvents = () => {
    _state.wallet.on("accountChanged", newAccountId => __awaiter(void 0, void 0, void 0, function* () {
      logger.log("onAccountChange", newAccountId);
      emitter.emit("signedOut", null);
    }));

    _state.wallet.on("rpcChanged", rpc => __awaiter(void 0, void 0, void 0, function* () {
      logger.log("onNetworkChange", rpc);

      if (options.network.networkId !== rpc.networkId) {
        yield signOut();
        emitter.emit("signedOut", null);
        emitter.emit("networkChanged", {
          networkId: rpc.networkId
        });
      }
    }));
  };

  const getAccounts = () => __awaiter(void 0, void 0, void 0, function* () {
    let accountId = _state.wallet.getAccountId();

    if (!accountId) {
      yield _state.wallet.resolveSignInState();
      accountId = _state.wallet.getAccountId();

      if (!accountId) {
        return [];
      }
    }

    return [{
      accountId
    }];
  });

  const isValidActions = actions => {
    return actions.every(x => x.type === "FunctionCall");
  };

  const transformActions = actions => {
    const validActions = isValidActions(actions);

    if (!validActions) {
      throw new Error(`Only 'FunctionCall' actions types are supported by ${metadata.name}`);
    }

    return actions.map(x => x.params);
  };

  const transformTransactions = transactions => {
    return transactions.map(transaction => {
      return {
        receiverId: transaction.receiverId,
        actions: transformActions(transaction.actions)
      };
    });
  };

  if (_state.wallet && _state.wallet.isSignedIn()) {
    setupEvents();
  }

  return {
    signIn({
      contractId,
      methodNames
    }) {
      return __awaiter(this, void 0, void 0, function* () {
        const existingAccounts = yield getAccounts();

        if (existingAccounts.length) {
          return existingAccounts;
        }

        const {
          accessKey,
          error
        } = yield _state.wallet.requestSignIn({
          contractId,
          methodNames
        });

        if (!accessKey || error) {
          yield signOut();
          throw new Error((typeof error === "string" ? error : error.type) || "Failed to sign in");
        }

        setupEvents();
        return yield getAccounts();
      });
    },

    signOut,

    getAccounts() {
      return __awaiter(this, void 0, void 0, function* () {
        return yield getAccounts();
      });
    },

    verifyOwner({
      message
    }) {
      return __awaiter(this, void 0, void 0, function* () {
        logger.log("NearFi:verifyOwner", {
          message
        });
        throw new Error(`Method not supported by ${metadata.name}`);
      });
    },

    signAndSendTransaction({
      signerId,
      receiverId,
      actions
    }) {
      return __awaiter(this, void 0, void 0, function* () {
        logger.log("signAndSendTransaction", {
          signerId,
          receiverId,
          actions
        });
        const {
          contract
        } = store.getState();

        if (!_state.wallet.isSignedIn() || !contract) {
          throw new Error("Wallet not signed in");
        }

        return _state.wallet.signAndSendTransaction({
          receiverId: receiverId || contract.contractId,
          actions: transformActions(actions)
        }).then(res => {
          var _a;

          if (res.error) {
            throw new Error(res.error);
          } // Shouldn't happen but avoids inconsistent responses.


          if (!((_a = res.response) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error("Invalid response");
          }

          return res.response[0];
        });
      });
    },

    signAndSendTransactions({
      transactions
    }) {
      return __awaiter(this, void 0, void 0, function* () {
        logger.log("signAndSendTransactions", {
          transactions
        });

        if (!_state.wallet.isSignedIn()) {
          throw new Error("Wallet not signed in");
        }

        return _state.wallet.requestSignTransactions({
          transactions: transformTransactions(transactions)
        }).then(res => {
          var _a;

          if (res.error) {
            throw new Error(res.error);
          } // Shouldn't happen but avoids inconsistent responses.


          if (!((_a = res.response) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error("Invalid response");
          }

          return res.response;
        });
      });
    }

  };
});

function setupNearFi({
  iconUrl = "./assets/nearfi-icon.png"
} = {}) {
  return () => __awaiter(this, void 0, void 0, function* () {
    const mobile = isMobile.isMobile();
    const installed = yield isInstalled();

    if (!mobile || !installed) {
      return null;
    } // Add extra wait to ensure NearFi's sign in status is read from the
    // browser extension background env.


    yield core.waitFor(() => {
      var _a;

      return !!((_a = window.nearFiWallet) === null || _a === void 0 ? void 0 : _a.isSignedIn());
    }, {
      timeout: 300
    }).catch(() => false);
    return {
      id: "nearfi",
      type: "injected",
      metadata: {
        name: "NearFi",
        description: "Your NEAR DeFi experience On The Go",
        iconUrl,
        downloadUrl: "https://nearfi.finance",
        deprecated: false,
        available: installed
      },
      init: NearFi
    };
  });
}

exports.setupNearFi = setupNearFi;
