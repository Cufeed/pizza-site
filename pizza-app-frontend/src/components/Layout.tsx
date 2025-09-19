import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import StaticPizzaBackground from './StaticPizzaBackground';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <StaticPizzaBackground>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </StaticPizzaBackground>
  );
};

export default Layout;
