/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f111a',
                surface: 'rgba(255, 255, 255, 0.05)',
                surfaceBorder: 'rgba(255, 255, 255, 0.1)',
                primary: '#6d28d9',
                secondary: '#0ea5e9'
            }
        },
    },
    plugins: [],
}
