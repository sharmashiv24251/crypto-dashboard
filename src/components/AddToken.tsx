import React, { useState } from "react";
import { TokenName } from "./UI/TokenName";
import Button from "./UI/Button";
import { StarIcon } from "./svg-icons";
import useIsMobile from "../hooks/useIsMobile";

type Token = {
  id: string;
  imgUrl?: string;
  name: string;
  tag: string;
  price: string;
  change24h: number;
  sparkline: number[];
  holdings: string;
  value: string;
};

type AddTokenProps = {
  tokens: Token[];
};

const AddToken: React.FC<AddTokenProps> = ({ tokens }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle token selection
  const toggleToken = (id: string) => {
    setSelectedTokens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div
      className="flex flex-col w-full bg-background"
      style={{ height: isMobile ? "500px" : "432px" }}
    >
      {/* Search Field */}
      <div
        className="flex-shrink-0 rounded-t-lg "
        style={{
          height: "52px",
          paddingTop: "0px",
          paddingBottom: "0px",
          borderColor: "rgba(255, 255, 255, 0.08)",
          borderWidth: "1px",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tokens (e.g., ETH, SOL)..."
          className="w-full h-full py-3 rounded-lg pl-4 text-text-default placeholder:text-text-muted bg-transparent outline-none focus:border-white/10 border-0"
        />
      </div>

      {/* Trending Label */}
      <div className="flex-shrink-0 pl-2 pt-3">
        <span
          className="text-text-muted font-medium pl-2"
          style={{ fontSize: "12px" }}
        >
          Trending
        </span>
      </div>

      {/* Scrollable Token List */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          height: isMobile
            ? "calc(500px - 52px - 56px)"
            : "calc(432px - 52px - 56px)",
        }}
      >
        {filteredTokens.map((token) => {
          const isSelected = selectedTokens.has(token.id);
          return (
            <div
              key={token.id}
              onClick={() => toggleToken(token.id)}
              className={`flex items-center justify-between w-full p-2 cursor-pointer transition-colors ${
                isSelected ? "bg-accent/[0.06]" : "hover:bg-accent/[0.06]"
              }`}
            >
              {/* Left: Token Name */}
              <div className="pl-2">
                <TokenName
                  imgUrl={token.imgUrl}
                  name={token.name}
                  tag={token.tag}
                  isModal={true}
                />
              </div>

              {/* Right: Checkbox */}
              <div className="flex items-center gap-4">
                {isSelected && <StarIcon />}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-accent border-accent"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div
        className="flex-shrink-0 flex justify-end items-center gap-2 bg-surface border-t border-white/10"
        style={{ height: "56px" }}
      >
        <Button size="lg" variant="primary" className="mr-4">
          Add to Wishlist
        </Button>
      </div>
    </div>
  );
};

export default AddToken;
