import { AddIcon, RefreshIcon, StarIcon } from "./svg-icons";
import Button from "./UI/Button";

const Table = () => {
  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center max-md:px-4">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center justify-center gap-2 text-text-default text-lg md:text-2xl font-medium">
          <StarIcon />
          Watchlist
        </div>
        <div className="flex flex-row items-center justify-center gap-3">
          <Button size="lg" variant="secondary">
            <div className="flex flex-row items-center justify-center gap-2">
              <RefreshIcon />
              Refresh Prices
            </div>
          </Button>
          <Button size="lg" variant="primary">
            <div className="flex flex-row items-center justify-center gap-2">
              <AddIcon />
              Add Token
            </div>
          </Button>
        </div>
      </div>
      <div className="w-full bg-surface h-96"></div>
    </div>
  );
};

export default Table;
