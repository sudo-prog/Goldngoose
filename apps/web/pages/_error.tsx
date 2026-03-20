import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          {statusCode || 'Error'}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          {statusCode === 404
            ? 'Page Not Found'
            : statusCode === 500
            ? 'Internal Server Error'
            : 'An error occurred'}
        </h2>
        <p className="text-gray-400 mb-8">
          {statusCode === 404
            ? 'The page you are looking for does not exist.'
            : 'Something went wrong on our end.'}
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;