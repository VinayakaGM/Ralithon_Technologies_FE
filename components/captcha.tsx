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
    // More challenging character set with similar-looking characters
    const similarChars = "0Oo1lIi2Zz5Ss6Gb9q";
    const normalChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz2346789";
    // 30% chance to include a confusing character
    const chars = Math.random() < 0.3 ? similarChars + normalChars : normalChars;
    
    let result = "";
    for (let i = 0; i < 6; i++) { // Increased length to 7 characters
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

    // Light background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines (in light gray)
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add noise dots (in light gray)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 1.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw each character with random distortions
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < text.length; i++) {
      ctx.save();

      const x = centerX + (i - 3) * 18; // Adjusted spacing for 7 chars
      const y = centerY + (Math.random() - 0.5) * 15; // More vertical variation

      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5); // More rotation

      // Black text with slight variations
      const darkness = 20 + Math.random() * 30; // 20-50% black variation
      ctx.fillStyle = `rgba(0, 0, 0, ${darkness / 100})`;
      
      // Random character scaling
      const scale = 0.8 + Math.random() * 0.4;
      ctx.scale(scale, scale);
      
      ctx.fillText(text[i], 0, 0);

      ctx.restore();
    }

    // Add a subtle overlay for more difficulty
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    // Case-sensitive comparison
    const valid = input === captchaText;
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
            width={150} // Wider canvas for 7 characters
            height={30}
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
          placeholder="Enter the code exactly as shown"
          value={userInput}
          onChange={handleInputChange}
          className={`${
            isValid === true
              ? "border-green-500 focus:border-green-500"
              : isValid === false
              ? "border-red-500 focus:border-red-500"
              : ""
          }`}
          maxLength={6} // Updated to match new length
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
          Enter the {captchaText.length}-character code exactly as shown (case-sensitive)
        </p>
      </div>
    </div>
  );
}