import { WalletIcon } from "./svg-icons";
import Button from "./UI/Button";

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
            <WalletIcon />
            <span>Connect Wallet</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Nav;
