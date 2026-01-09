import React from 'react';
import { useAuth } from '../services/authContext';

const LoginView: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="flex h-screen items-center justify-center bg-[#0f1712] text-white">
            <div className="text-center p-8 bg-[#1c2621] rounded-2xl shadow-2xl max-w-md w-full border border-emerald-900/30">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Smart Planner
                </h1>
                <p className="text-gray-400 mb-8 font-light">
                    당신의 하루를 더 스마트하게 관리하세요.
                </p>

                <button
                    onClick={login}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 transition-all font-medium py-3 px-4 rounded-xl shadow-lg transform hover:-translate-y-0.5"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google Logo"
                        className="w-6 h-6"
                    />
                    <span>Google 계정으로 계속하기</span>
                </button>

                <p className="mt-6 text-xs text-gray-500">
                    로그인하면 개인 데이터가 안전하게 클라우드에 저장됩니다.
                </p>
            </div>
        </div>
    );
};

export default LoginView;
