declare module 'tailwindcss/defaultConfig' {
  const config: {
    theme: {
      screens: Record<string, string>;
      // Add other Tailwind CSS theme properties as needed
    };
    // Add other Tailwind CSS configuration properties as needed
  };
  export default config;
}
