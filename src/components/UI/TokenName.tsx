type TokenNameProps = {
  imgUrl?: string;
  name: string;
  tag: string;
  isModal?: boolean;
};
export const TokenName: React.FC<TokenNameProps> = ({
  imgUrl,
  name,
  tag,
  isModal,
}) => (
  <div className="flex items-center gap-3">
    <div
      className="bg-teal rounded flex-shrink-0"
      style={{
        width: isModal ? 32 : 24,
        height: isModal ? 32 : 24,
        borderRadius: 4,
      }}
    />
    <div className="flex items-center gap-3">
      <span className="text-text-default text-sm">{name}</span>
      <span
        className={`${
          isModal ? "text-text-default" : "text-text-muted"
        } text-sm`}
      >
        ({tag.trim()})
      </span>
    </div>
  </div>
);
