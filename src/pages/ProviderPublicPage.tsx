// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// import { Star, MapPin } from "lucide-react";

// export default function ProviderPublicPage() {

//   const { id } = useParams();

//   const [provider, setProvider] = useState<any>(null);
//   const [services, setServices] = useState<any[]>([]);
//   const [reviews, setReviews] = useState<any[]>([]);
//   const [selectedService, setSelectedService] = useState<any>(null);

//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [description, setDescription] = useState("");

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProvider();
//   }, [id]);

//   const fetchProvider = async () => {

//     if (!id) return;

//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("user_id", id)
//       .single();

//     const { data: svcs } = await supabase
//       .from("services")
//       .select("*, categories(name)")
//       .eq("provider_id", id);

//     const { data: revs } = await supabase
//       .from("reviews")
//       .select("*")
//       .eq("provider_id", id);

//     setProvider(profile);
//     setServices(svcs || []);
//     setReviews(revs || []);

//     setLoading(false);
//   };

//   const bookService = async () => {

//     if (!selectedService) return;

//     // await supabase.from("service_requests").insert({
//       provider_id: id,
//       service_id: selectedService.id,
//       description: description,
//       preferred_date: date,
//       preferred_time: time,
//       address: address,
//       customer_name: name,
//       customer_phone: phone,
//       status: "pending",
//     });

//     alert("Request sent to provider!");

//     setSelectedService(null);
//     setName("");
//     setPhone("");
//     setAddress("");
//     setDate("");
//     setTime("");
//     setDescription("");
//   };

//   if (loading) {
//     return (
//       <div className="p-10 text-center">
//         Loading provider...
//       </div>
//     );
//   }

//   if (!provider) {
//     return (
//       <div className="p-10 text-center">
//         Provider not found
//       </div>
//     );
//   }

//   const avgRating =
//     reviews.length > 0
//       ? Math.round(
//           (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
//         ) / 10
//       : 0;

//   return (

//     <div className="container mx-auto max-w-3xl px-4 py-10">

//       {/* Provider Info */}

//       <Card className="mb-6 shadow-card border-0">

//         <CardContent className="p-6">

//           <h1 className="text-xl font-bold">
//             {provider.full_name}
//           </h1>

//           {provider.location && (
//             <p className="flex items-center gap-1 text-sm text-muted-foreground">
//               <MapPin className="h-4 w-4" />
//               {provider.location}
//             </p>
//           )}

//           {avgRating > 0 && (
//             <p className="flex items-center gap-1 mt-2">
//               <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//               {avgRating} ({reviews.length} reviews)
//             </p>
//           )}

//         </CardContent>

//       </Card>


//       {/* Services */}

//       <h2 className="font-semibold mb-4 text-lg">
//         Services
//       </h2>

//       <div className="space-y-4">

//         {services.map((service) => (

//           <Card key={service.id} className="border-0 shadow-card">

//             <CardContent className="p-6">

//               <div className="flex justify-between">

//                 <div>

//                   <h3 className="font-semibold">
//                     {service.title}
//                   </h3>

//                   <p className="text-sm text-muted-foreground">
//                     {service.description}
//                   </p>

//                   <p className="text-xs mt-1 text-muted-foreground">
//                     {service.categories?.name}
//                   </p>

//                 </div>

//                 <div className="text-right">

//                   <p className="font-bold text-primary">
//                     ₹{service.price}
//                   </p>

//                   <Button
//                     className="mt-2"
//                     onClick={() => setSelectedService(service)}
//                   >
//                     Book
//                   </Button>

//                 </div>

//               </div>

//             </CardContent>

//           </Card>

//         ))}

//       </div>


//       {/* Booking Form */}

//       {selectedService && (

//         <Card className="mt-8 border-0 shadow-card">

//           <CardContent className="p-6 space-y-3">

//             <h2 className="font-semibold">
//               Book {selectedService.title}
//             </h2>

//             <Input
//               placeholder="Your name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />

//             <Input
//               placeholder="Phone number"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />

//             <Input
//               placeholder="Address"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//             />

//             <Input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />

//             <Input
//               type="time"
//               value={time}
//               onChange={(e) => setTime(e.target.value)}
//             />

//             <Textarea
//               placeholder="Describe your problem"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />

//             <Button
//               className="w-full"
//               onClick={bookService}
//             >
//               Send Request
//             </Button>

//           </CardContent>

//         </Card>

//       )}


//       {/* Reviews */}

//       {reviews.length > 0 && (

//         <div className="mt-10">

//           <h2 className="font-semibold mb-4 text-lg">
//             Reviews
//           </h2>

//           <div className="space-y-3">

//             {reviews.map((r) => (

//               <Card key={r.id} className="border-0 shadow-card">

//                 <CardContent className="p-5">

//                   <div className="flex gap-1 mb-1">

//                     {[1,2,3,4,5].map((s)=>(
//                       <Star
//                         key={s}
//                         className={`h-4 w-4 ${
//                           s <= r.rating
//                           ? "fill-yellow-400 text-yellow-400"
//                           : "text-gray-300"
//                         }`}
//                       />
//                     ))}

//                   </div>

//                   {r.comment && (
//                     <p className="text-sm text-muted-foreground">
//                       {r.comment}
//                     </p>
//                   )}

//                 </CardContent>

//               </Card>

//             ))}

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }