import logoAsset from "@/assets/swiftmynd-logo.png.asset.json";

export function BrandLogo({ className = "size-9" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Swift Mynd"
      className={`${className} object-contain shrink-0 max-w-full`}
      loading="eager"
      decoding="async"
    />
  );
}
