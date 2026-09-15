# Marketing sources

Kitchen AI asks where people heard about the app at the end of onboarding. Answers wait locally until sign-in, then sync to `public.acquisition_responses`. Failed uploads retry while the app is open and when reopened. One original answer is stored per account, so repeated launches do not increase counts. Anonymous onboarding drop-offs are not included.

As the project owner, open Supabase > SQL Editor and run:

```sql
select source, count(*) as signups,
 round(100.0 * count(*) / sum(count(*)) over (), 1) as percentage
from public.acquisition_responses
group by source
order by signups desc;
```

For monthly trends:

```sql
select date_trunc('month', created_at)::date as month, source, count(*) as signups
from public.acquisition_responses
group by 1, 2
order by 1 desc, 3 desc;
```

This is self-reported acquisition, not ad attribution or proof of paid campaign performance. The app cannot read other users' responses. Do not expose owner credentials or this aggregate query through a public client. Account deletion removes its response.

## Saved onboarding answers

The initial completed answers are stored separately in `public.onboarding_answers` after sign-in, including birth date, optional gender and dietary choices. These are private account records, not marketing aggregates. Row-level security allows users to read only their own record. This stores the initial questionnaire; it does not yet restore preferences automatically on another device.
