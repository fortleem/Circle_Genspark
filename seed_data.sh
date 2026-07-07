#!/bin/bash
# Seed comprehensive mock data for all sparse/empty tables via the API
BASE="http://localhost:3000/api"

echo "=== Seeding Pulse Events ==="
for i in 1 2 3 4 5 6 7 8; do
  curl -s -X POST "$BASE/pulse/event" \
    -H "Content-Type: application/json" \
    -d "{\"pillar\":\"$(echo wasl mashahd midan lamahat pay mesh governance rihla | tr ' ' '\n' | sed -n "${i}p")\",\"kind\":\"$(echo message video post photo tip relay vote itinerary | tr ' ' '\n' | sed -n "${i}p")\",\"weight\":$((RANDOM % 10 + 1)),\"city\":\"$(echo Cairo Alexandria Giza Luxor Aswan Hurghada Mansoura Tanta | tr ' ' '\n' | sed -n "${i}p")\"}" > /dev/null
done
echo "Done"

echo "=== Seeding Time Capsules ==="
for i in 2 3 4 5; do
  curl -s -X POST "$BASE/capsules" \
    -H "Content-Type: application/json" \
    -d "{\"author_id\":$i,\"pillar\":\"$(echo wasl mashahd midan lamahat | tr ' ' '\n' | sed -n "$((i-1))p")\",\"payload\":\"$(echo 'A message to the future: technology will bring us closer.' 'My prediction: Egypt will lead Africa in AI by 2030.' 'Dear future self: remember this moment of creation.' 'The community we built together will outlast us all.' | sed -n "$((i-1))p")\",\"unseal_at\":\"2027-0$i-01T00:00:00Z\",\"visibility\":\"public\"}" > /dev/null
done
echo "Done"

echo "=== Seeding Whispers ==="
for i in 1 2 3 4; do
  curl -s -X POST "$BASE/whispers" \
    -H "Content-Type: application/json" \
    -d "{\"from_user\":$((i+1)),\"to_user\":1,\"body\":\"$(echo 'Have you seen the new governance proposal?' 'Meeting at Tahrir Square cafe, 5pm?' 'The encryption keys have been rotated.' 'Check the new Mashahd documentary!' | sed -n "${i}p")\",\"ttl_seconds\":$((3600 * i)),\"max_views\":$((i+2))}" > /dev/null
done
echo "Done"

echo "=== Seeding Video Comments ==="
for vid in 100 101 102 103; do
  for j in 1 2 3; do
    uid=$((j + 1))
    curl -s -X POST "$BASE/mashahd/videos/$vid/comments" \
      -H "Content-Type: application/json" \
      -d "{\"user_id\":$uid,\"body\":\"$(echo 'Incredible cinematography!' 'This deserves more views.' 'The knowledge graph sidebar is genius.' 'Shared this with my whole family.' 'Best content on Cirkle this week.' 'The fact-checking overlay is so useful!' | shuf -n 1)\",\"is_bullet\":$((RANDOM % 2)),\"time_offset\":$((RANDOM % 240))}" > /dev/null
  done
done
echo "Done"

echo "=== Seeding Echoes ==="
for room in "!general:matrix.cirkle.app" "!tech-talk:matrix.cirkle.app" "!direct-ahmed-layla:matrix.cirkle.app"; do
  curl -s -X POST "$BASE/echoes" \
    -H "Content-Type: application/json" \
    -d "{\"room_id\":\"$room\",\"span_start\":0,\"span_end\":50,\"summary\":\"Discussion about Cirkle features and Egyptian tech community growth.\",\"sentiment\":\"positive\",\"key_actors\":\"Ahmed, Layla, Omar\"}" > /dev/null
  curl -s -X POST "$BASE/echoes" \
    -H "Content-Type: application/json" \
    -d "{\"room_id\":\"$room\",\"span_start\":51,\"span_end\":100,\"summary\":\"Debate on privacy policies and community moderation standards.\",\"sentiment\":\"neutral\",\"key_actors\":\"Fatima, Youssef, Mei\"}" > /dev/null
done
echo "Done"

echo "=== Seeding Post Replies ==="
for pid in 1 2 3 10 11; do
  for r in 1 2; do
    uid=$((r + 2))
    curl -s -X POST "$BASE/midan/posts/$pid/reply" \
      -H "Content-Type: application/json" \
      -d "{\"author_id\":$uid,\"content\":\"$(echo 'Great point! I agree completely.' 'Interesting perspective, but have you considered...' 'This resonates with my experience in Cairo.' 'Thanks for sharing! More people need to see this.' | shuf -n 1)\"}" > /dev/null 2>/dev/null
  done
done
echo "Done"

echo "=== All seed data inserted ==="
