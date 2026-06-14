import logoAsset from "@/assets/zaherly-logo.jpg.asset.json";

export function BrandLogo({ className = "size-9" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="ظاهرلي - Zaherly"
      className={`${className} object-contain shrink-0 max-w-full`}
      loading="eager"
      decoding="async"
    />
  );
}
