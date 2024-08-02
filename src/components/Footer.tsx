'use client';

const Footer = () => {
    return (
        <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
            <p className="text-sm md:text-base lg:text-lg">
                Anonymous Feedback &copy; 2024. All rights reserved.
            </p>
            <p className="text-sm md:text-base lg:text-lg">
                Made with ❤️ by{' '}
                <a
                    href="https://linkedin.com/in/dev-soni-sde/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                >
                    Dev Soni
                </a>
            </p>
        </footer>
    );
}

export default Footer;