import { Wallet } from 'lucide-react';
import Login from './Login';

const Navbar = () => {
    return (
        <nav className="bg-white fixed w-full top-0 z-50 border-b border-black h-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center group cursor-pointer">
                        <div className="transform group-hover:rotate-12 transition-transform">
                            <Wallet className="h-8 w-8 text-black" />
                        </div>
                        <span className="ml-2 text-2xl font-bold text-black font-montserrat">
                            AURORA
                        </span>
                    </div>
                    <div className="flex items-center space-x-8">
                        <Login />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;