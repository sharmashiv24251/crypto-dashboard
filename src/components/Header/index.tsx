import HeaderChart from "./HeaderChart";
import PortfolioValue from "./PortfolioValue";

const Header = () => {
  return (
    <div className="bg-surface md:rounded-xl p-6 w-full flex max-md:flex-col items-center justify-center gap-8 md:gap-5">
      <div className="md:w-1/2 w-full flex flex-col items-start justify-between">
        <PortfolioValue />
      </div>
      <div className="md:w-1/2 w-full flex flex-col items-start justify-between">
        <HeaderChart />
      </div>
    </div>
  );
};

export default Header;
