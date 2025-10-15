import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import { usePassword } from '../../../Context/PasswordContext';
import ConfirmPassword from '../confirmPassword/ConfirmPassword';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, resendOTP, loading } = usePassword();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (otpRequested && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [otpRequested, countdown]);

  const handleSendOTP = async () => {
    if (!email || resendDisabled) return;

    setResendDisabled(true);
    const result = await sendOTP(email);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: result.data?.message || 'OTP sent successfully',
        confirmButtonColor: '#fbbf24',
      });
      setOtpRequested(true);
      setCountdown(60);
    } else {
      setErrorMessage(result.error?.message || 'Failed to send OTP');
      setResendDisabled(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    const result = await verifyOTP(email, otp);
    if (result.success) {
      setOtpVerified(true);
      setErrorMessage('');
    } else {
      setErrorMessage(result.error?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="relative bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <i className="fa fa-times text-xl"></i>
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Forgot Password
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            otpRequested ? resendOTP(email) : handleSendOTP();
          }}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
          {errorMessage && (
            <div className="text-red-600 text-sm font-medium mt-2">{errorMessage}</div>
          )}

          <div className="flex items-center space-x-2 mt-2">
            <button
              type="submit"
              disabled={resendDisabled || !email}
              className="text-amber-400 font-semibold hover:underline disabled:opacity-50"
            >
              {otpRequested ? 'Resend OTP' : 'Send OTP'}
            </button>
            {otpRequested && countdown > 0 && <span>{countdown} seconds</span>}
          </div>
        </form>

        {otpRequested && !otpVerified && (
          <div className="mt-6">
            <div className="flex justify-center gap-2">
              {/* <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                separator={<span className="w-2"></span>}
                inputType="number"
                disabled={otpVerified}
                inputStyle={{
                  width: '2.5rem',
                  height: '2.5rem',
                  fontSize: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                }}
                focusStyle={{
                  outline: 'none',
                  boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.1)',
                  borderColor: '#fbbf24',
                }}
              /> */}
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => (
                  <input
                    {...props}
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      fontSize: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                      textAlign: 'center',
                    }}
                  />
                )}
              />

            </div>
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || otpVerified}
              className="w-full mt-4 bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              Verify OTP
            </button>
          </div>
        )}

        {otpVerified && <ConfirmPassword email={email} otp={otp} />}
      </div>
    </div>
  );
};

export default ResetPassword;