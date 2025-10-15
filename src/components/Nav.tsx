import { WalletIcon } from "./svg-icons";
import Button from "./UI/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Nav = () => {
  return (
    <div className="flex flex-row justify-between items-center max-w-screen-2xl mx-auto">
      <div className="pl-4 sm:pl-3 py-4 sm:py-[14px] h-full flex-1 flex items-center justify-start gap-3">
        <Button
          className="rounded-md h-7 w-7 flex items-center justify-center"
          round
          variant="primary"
        >
          <WalletIcon />
        </Button>
        <span className="text-xl font-semibold text-white">
          Token Portfolio
        </span>
      </div>
      <div className="h-full p-3 sm:p-3 pl-1.5">
        <Button size="sm" round variant="primary">
          <div className="flex flex-row items-center gap-1.5">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== "loading";
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="flex flex-row items-center gap-1.5"
                          >
                            <WalletIcon />
                            <span>Connect Wallet</span>
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="flex flex-row items-center gap-1.5"
                          >
                            <WalletIcon />
                            <span>Wrong network</span>
                          </button>
                        );
                      }

                      return (
                        <div style={{ display: "flex", gap: 12 }}>
                          {/* <button
                            onClick={openChainModal}
                            style={{ display: "flex", alignItems: "center" }}
                            type="button"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}

                            {chain.name}
                          </button> */}

                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="flex flex-row items-center gap-1.5 cursor-pointer"
                          >
                            <WalletIcon />
                            {account.displayName}
                            {/* {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ""} */}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Nav;
