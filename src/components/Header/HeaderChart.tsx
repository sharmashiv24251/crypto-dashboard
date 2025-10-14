import { Chart, type Slice } from "../UI/Chart";

const HeaderChart: React.FC = () => {
  const mockData: Slice[] = [
    { label: "Bitcoin (BTC)", value: 14.7, color: "#32CA5B" },
    { label: "Ethereum (ETH)", value: 45.1, color: "#A78BFA" },
    { label: "Solana (SOL)", value: 10.1, color: "#18C9DD" },
    { label: "Dogecoin (DOGE)", value: 10.1, color: "#FB923C" },
    { label: "Solana (SOL)", value: 10.1, color: "#FB7185" },
    { label: "Solana (SOL)", value: 10.1, color: "#2AD2D6" },
  ];

  const total = mockData.reduce((s, d) => s + d.value, 0);

  return (
    <section className="w-full text-[14px]">
      <span className="text-[14px] text-[var(--color-text-muted)] font-medium mb-4 block md:block">
        Portfolio Total
      </span>

      <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0">
          <Chart data={mockData} />
        </div>

        <div className="w-full md:w-auto flex-1">
          <ul className="space-y-4 max-w-full">
            {mockData.map((d, i) => {
              const percentage = (d.value / total) * 100 || 0;
              return (
                <li
                  key={d.label + i}
                  className="flex items-center justify-between w-full md:pr-8"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[14px]" style={{ color: d.color }}>
                      {d.label}
                    </span>
                  </div>

                  <div className="ml-auto md:ml-12 flex-shrink-0 text-right">
                    <span className="text-[14px] font-medium text-text-muted">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeaderChart;
