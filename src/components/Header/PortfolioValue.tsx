const PortfolioValue = () => {
  return (
    <>
      <div className="flex flex-col items-start gap-5">
        <span className="text-text-muted text-base font-medium">
          Portfolio Total
        </span>
        <span className="text-text-default text-[40px] md:text-[56px] font-medium">
          $10,275.08
        </span>
      </div>
      <span className="pt-5 md:pt-[100px] text-text-muted text-xs">
        Last updated: 3:42:12 PM
      </span>
    </>
  );
};

export default PortfolioValue;
