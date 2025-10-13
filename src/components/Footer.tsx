const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Dalton Omondi
              </div>
              <p className="text-sm text-muted-foreground">
                Machine Learning + Hardware Engineer
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Dalton Omondi. Built with passion and precision.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Designed for impact. Engineered for excellence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
