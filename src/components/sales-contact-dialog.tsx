
'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SalesContactDialog() {
  const { t } = useTranslation();
  const { isContactFormOpen, setIsContactFormOpen } = useBiomassStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: t('validation_required' as any) }),
    surname: z.string().min(1, { message: t('validation_required' as any) }),
    email: z.string().email({ message: t('validation_email' as any) }),
    phone: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://pg-n8n.kynegos.net/webhook-test/8ede1e54-d63b-4217-aa83-43c967e2a58a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      toast({
        title: t('contact_success_title' as any),
        description: t('contact_success_desc' as any),
      });
      handleClose();

    } catch (error) {
      console.error('Failed to submit form:', error);
      toast({
        variant: 'destructive',
        title: t('contact_error_title' as any),
        description: t('contact_error_desc' as any),
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setIsContactFormOpen(false);
  }

  return (
    <Dialog open={isContactFormOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('contact_sales_title' as any)}</DialogTitle>
          <DialogDescription>{t('contact_sales_desc' as any)}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('form_name' as any)}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('form_surname' as any)}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('form_email' as any)}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form_phone' as any)} <span className="text-xs text-muted-foreground">({t('form_optional' as any)})</span></FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='pt-4'>
              <Button type="button" variant="outline" onClick={handleClose} className="border-[#BFBFBF]" disabled={isSubmitting}>
                {t('cancel' as any)}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('sending' as any) : t('send' as any)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
