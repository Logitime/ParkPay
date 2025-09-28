'use client';
import type { PredictOccupancyOutput } from '@/ai/flows/occupancy-prediction';
import { getOccupancyPrediction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { z } from 'zod';

const formSchema = z.object({
  description: z
    .string()
    .min(20, {
      message: 'Please provide a more detailed description (at least 20 characters).',
    })
    .max(500),
});

const occupancyColors = {
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-red-500',
  default: 'text-foreground',
};

export function OccupancyPrediction() {
  const [prediction, setPrediction] = useState<PredictOccupancyOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrediction(null);
    const { data, error } = await getOccupancyPrediction(values);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error,
      });
    } else if (data) {
      setPrediction(data);
    }
  }

  const chartData = prediction
    ? [
        {
          subject: 'Confidence',
          value: prediction.confidence * 100,
          fullMark: 100,
        },
      ]
    : [];

  const occupancyColorClass =
    (prediction &&
      occupancyColors[
        prediction.occupancyLevel.toLowerCase() as keyof typeof occupancyColors
      ]) ||
    occupancyColors.default;

  return (
    <Card className="lg:col-span-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>AI Occupancy Prediction</CardTitle>
                <CardDescription>
                  Predict occupancy based on current conditions.
                </CardDescription>
              </div>
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                  Analyzing conditions...
                </p>
              </div>
            ) : prediction ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={chartData}
                    >
                      <PolarGrid gridType="circle" />
                      <PolarAngleAxis dataKey="subject" tick={() => null} />
                      <Radar
                        name="Confidence"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-muted-foreground -mt-4">Confidence</p>
                <p className={`text-4xl font-bold font-headline mt-2 capitalize ${occupancyColorClass}`}>
                  {prediction.occupancyLevel}
                </p>
                <p className="text-center text-sm text-muted-foreground mt-2 px-4">
                  {prediction.reason}
                </p>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Describe current conditions (weather, events, etc.)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Weekday afternoon, rainy, local football game nearby...'"
                          className="resize-none"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {prediction || isLoading ? (
              <Button
                variant="outline"
                onClick={() => {
                  setPrediction(null);
                  form.reset();
                }}
              >
                Start New Prediction
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Predict
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
