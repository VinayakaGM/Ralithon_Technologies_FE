"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  reset?: number;
}

export function Captcha({ onVerify, reset }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < text.length; i++) {
      ctx.save();

      const x = centerX + (i - 2.5) * 20;
      const y = centerY + (Math.random() - 0.5) * 10;

      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);

      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 30%)`;
      ctx.fillText(text[i], 0, 0);

      ctx.restore();
    }
  };

  const initializeCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput("");
    setIsValid(null);
    onVerify(false);

    setTimeout(() => {
      drawCaptcha(newCaptcha);
    }, 100);
  };

  const verifyCaptcha = (input: string) => {
    const valid = input.toLowerCase() === captchaText.toLowerCase();
    setIsValid(valid);
    onVerify(valid);
    return valid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (value.length === captchaText.length) {
      verifyCaptcha(value);
    } else {
      setIsValid(null);
      onVerify(false);
    }
  };

  useEffect(() => {
    initializeCaptcha();
  }, [reset]);

  return (
    <div className="space-y-3">
      <Label htmlFor="captcha">Verification Code</Label>

      {/* CAPTCHA Canvas */}
      <div className="flex items-center space-x-2">
        <div className="border rounded-md p-2 bg-gray-50">
          <canvas
            ref={canvasRef}
            width={150}
            height={50}
            className="border rounded"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={initializeCaptcha}
          className="p-2 bg-transparent"
          title="Refresh CAPTCHA"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Input Field */}
      <div className="space-y-1">
        <Input
          id="captcha"
          type="text"
          placeholder="Enter the code above"
          value={userInput}
          onChange={handleInputChange}
          className={`${
            isValid === true
              ? "border-green-500 focus:border-green-500"
              : isValid === false
              ? "border-red-500 focus:border-red-500"
              : ""
          }`}
          maxLength={6}
          autoComplete="off"
        />

        {/* Validation Messages */}
        {isValid === true && (
          <p className="text-green-600 text-xs flex items-center">
            ✓ Verification successful
          </p>
        )}
        {isValid === false && userInput.length === captchaText.length && (
          <p className="text-red-500 text-xs flex items-center">
            ✗ Incorrect code. Please try again.
          </p>
        )}

        <p className="text-xs text-gray-500">
          Enter the {captchaText.length}-character code shown above
        </p>
      </div>
    </div>
  );
}
