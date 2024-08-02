'use client';

import MessageCardCarousel from '@/components/MessageCardCarousel';

const HomePage = () => {
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-800 text-white">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Let&apos;s Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            Anonymous Feedback - Where your identity remains a secret.
          </p>
        </section>

        <MessageCardCarousel />
      </main>
    </>
  );
}

export default HomePage;