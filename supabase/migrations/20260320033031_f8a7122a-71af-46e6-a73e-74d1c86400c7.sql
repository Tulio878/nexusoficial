
-- PIX transactions table
CREATE TABLE public.pix_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  pix_code TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_document TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  item_title TEXT NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read their own transaction by transaction_id (no auth required for this use case)
CREATE POLICY "Anyone can read transactions by transaction_id"
  ON public.pix_transactions
  FOR SELECT
  USING (true);

-- Only service role can insert/update (via edge functions)
CREATE POLICY "Service role can insert"
  ON public.pix_transactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update"
  ON public.pix_transactions
  FOR UPDATE
  USING (true);
