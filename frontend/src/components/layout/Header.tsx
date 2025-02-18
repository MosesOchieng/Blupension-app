import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/utils/auth';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <button
            type="button"
            className="lg:hidden px-4 text-gray-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center">
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
              aria-label="View notifications"
            >
              <BellIcon className="h-6 w-6" />
            </button>

            <div className="ml-4 flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.avatar || '/default-avatar.png'}
                alt=""
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 