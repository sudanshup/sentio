import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import clsx from 'clsx';

export function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setError('Voice recognition is not supported in this browser.');
                return;
            }

            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        transcript += result[0].transcript + ' ';
                    }
                }

                if (transcript) {
                    onTranscript(transcript);
                }
            };

            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };

            recognitionInstance.onend = () => {
                setIsRecording(false);
            };

            setRecognition(recognitionInstance);
        }
    }, [onTranscript]);

    const toggleRecording = () => {
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
        } else {
            setError(null);
            try {
                recognition.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Failed to start recording:", err);
            }
        }
    };

    if (error) {
        return null;
    }

    return (
        <button
            onClick={toggleRecording}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all w-auto",
                isRecording
                    ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
            type="button"
        >
            {isRecording ? (
                <>
                    <MicOff className="w-4 h-4" /> <span>Stop</span>
                </>
            ) : (
                <>
                    <Mic className="w-4 h-4" /> <span>Voice</span>
                </>
            )}
        </button>
    );
}
