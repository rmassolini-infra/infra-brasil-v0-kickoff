const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-sm" />
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">INFRA</span>
        <span className="text-lg font-bold tracking-tight">BRASIL</span>
      </div>
    </div>
  );
};

export default Logo;
