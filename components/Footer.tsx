import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-center mt-8 text-gray-600/90 dark:text-white/90 text-sm">
            <div className="mb-4">
                <p>💡 <strong>Edit the table above, then click "Update Heatmap" to see changes.</strong></p>
                <p>Rectangle size = Market Capital share | Color intensity shows change magnitude | Hover for details</p>
            </div>
            <p>
                Made with love by <a href="https://www.linkedin.com/in/gamaleldien" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 font-bold hover:underline">Gamal Eldien</a>
            </p>
        </footer>
    );
};

export default Footer;