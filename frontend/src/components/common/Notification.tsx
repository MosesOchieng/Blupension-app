import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { create } from 'zustand';

interface NotificationStore {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  showNotification: (message: string, type: 'success' | 'error') => void;
  hideNotification: () => void;
}

export const useNotification = create<NotificationStore>((set) => ({
  show: false,
  message: '',
  type: 'success',
  showNotification: (message, type) => {
    set({ show: true, message, type });
    setTimeout(() => {
      set({ show: false });
    }, 5000);
  },
  hideNotification: () => set({ show: false }),
}));

export default function Notification() {
  const { show, message, type, hideNotification } = useNotification();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {type === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    type="button"
                    className="rounded-md inline-flex text-gray-400 hover:text-gray-500"
                    onClick={hideNotification}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
} 