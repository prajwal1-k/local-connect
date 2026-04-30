-- Make request_id nullable in reviews table to allow reviews without a booking
BEGIN;

-- Drop the existing foreign key constraint
ALTER TABLE public.reviews
DROP CONSTRAINT reviews_request_id_fkey;

-- Make the column nullable
ALTER TABLE public.reviews
ALTER COLUMN request_id DROP NOT NULL;

-- Re-add the foreign key constraint (now allows NULL)
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_request_id_fkey 
  FOREIGN KEY (request_id) 
  REFERENCES public.service_requests(id) 
  ON DELETE SET NULL;

COMMIT;
