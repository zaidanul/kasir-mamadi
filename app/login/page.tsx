import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111827] px-6 py-8 mx-auto md:h-screen lg:py-0 font-sans">
      <div className="w-full bg-[#1f2937] rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0 border border-zinc-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              {/* Fake Flowbite Logo */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-4 h-4 bg-blue-300 rounded-full right-[-2px] bottom-[-2px]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white z-10 ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Kasir</span>
            </Link>
          </div>
          
          <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
            Sign in to your account
          </h1>
          
          <form className="space-y-4 md:space-y-6" action="#">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                Your email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-[#374151] border border-zinc-600 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-[#374151] border border-zinc-600 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    className="w-4 h-4 border border-zinc-600 rounded bg-[#374151] focus:ring-3 focus:ring-blue-300 ring-offset-gray-800"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>
              <a href="#" className="text-sm font-medium text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
            >
              Sign in
            </button>
            <p className="text-sm font-light text-gray-400">
              Don’t have an account yet?{" "}
              <a href="#" className="font-medium text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
