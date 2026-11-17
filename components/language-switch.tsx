"use client";
export function LanguageSwitch({
  ceb,
  onChange,
}: {
  ceb: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="language-switch"
      role="switch"
      aria-label="Cebuano"
      aria-checked={ceb}
      onClick={() => onChange(!ceb)}
    >
      <span lang="en" data-selected={!ceb}>
        EN
      </span>
      <span lang="ceb" data-selected={ceb}>
        CEB
      </span>
    </button>
  );
}
