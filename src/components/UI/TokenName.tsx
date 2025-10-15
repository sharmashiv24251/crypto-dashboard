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
      className="rounded flex-shrink-0 overflow-hidden"
      style={{
        width: isModal ? 32 : 24,
        height: isModal ? 32 : 24,
        borderRadius: 4,
      }}
    >
      {imgUrl && (
        <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
      )}
      {!imgUrl && (
        <div className="w-full h-full bg-surface flex items-center justify-center">
          {name.charAt(0)}
        </div>
      )}
    </div>
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
