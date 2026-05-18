import { Router } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { ChatWithAssistantBody, AnalyzeImageBody, VerifyMedicineBody } from "@workspace/api-zod";

const router = Router();

const SYSTEM_PROMPT = `أنت صيدلاني مصري اسمك "فارما" بتشتغل على منصة صحتي.
بتكلم الناس بالعامية المصرية الطبيعية زي ما بيتكلموا في الشارع، مش لغة عربية رسمية.
ردودك منظمة وواضحة، بتستخدم نقاط وعناوين لما الموضوع يحتاج.
دايما بتجاوب على السؤال الحقيقي اللي الشخص عايز يعرفه.

أسلوبك في الكلام:
- بتقول "دوا" مش "دواء"، "كويس" مش "جيد"، "عشان" مش "لأن"، "دلوقتي" مش "الآن"
- بتقول "خد بالك" و"ربنا يشفيك" و"مفيش داعي للقلق"
- بتشرح الجرعات والتأثيرات بأمثلة بسيطة من الحياة اليومية

قواعد مهمة:
- لا تديش تشخيص طبي قطعي
- لو الحالة تحتاج طبيب، قول ده بوضوح وبصراحة
- في الآخر دايما حط تحذير: "⚕️ الكلام ده للتوعية بس. استشر دكتورك أو صيدلانيك."`;

// POST /assistant/chat
router.post("/assistant/chat", async (req, res) => {
  const parseResult = ChatWithAssistantBody.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { messages, medicineContext } = parseResult.data;

  try {
    const systemMessage = medicineContext
      ? `${SYSTEM_PROMPT}\n\nالسياق: الشخص بيسأل عن دوا "${medicineContext}" - ركز على معلومات الدوا ده.`
      : SYSTEM_PROMPT;

    const chatMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct",
      max_tokens: 8192,
      temperature: 0.7,
      messages: chatMessages,
    });

    const reply = response.choices[0]?.message?.content ?? "معلش، حصل خطأ. حاول تاني.";

    return res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "Error calling AI assistant");
    return res.status(500).json({ error: "AI assistant unavailable" });
  }
});

// POST /assistant/verify-medicine
router.post("/assistant/verify-medicine", async (req, res) => {
  const parseResult = VerifyMedicineBody.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { disease, tradeName } = parseResult.data;

  try {
    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `أنت صيدلاني مصري خبير. مهمتك تتحقق إذا كان دواء معين بيُستخدم فعلاً لعلاج مرض معين.
رد بـ JSON فقط بدون أي كلام تاني، بالشكل ده:
{
  "isForDisease": true أو false,
  "explanation": "شرح بالعامية المصرية في 2-3 جمل",
  "alternatives": ["دواء 1", "دواء 2"] (لو في بدائل أشهر أو أنسب)
}`
        },
        {
          role: "user",
          content: `المرض أو الشكوى: ${disease}
الاسم التجاري للدواء: ${tradeName}

هل الدواء ده بيتستخدم فعلاً لعلاج المرض ده؟`
        }
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "{}";
    
    let parsed: { isForDisease?: boolean; explanation?: string; alternatives?: string[] } = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      parsed = {};
    }

    return res.json({
      isForDisease: parsed.isForDisease ?? false,
      explanation: parsed.explanation ?? "مش قادر أتحقق دلوقتي. حاول تاني أو اسأل صيدلاني.",
      alternatives: parsed.alternatives ?? []
    });
  } catch (err) {
    req.log.error({ err }, "Error verifying medicine");
    return res.status(500).json({ error: "Verification unavailable" });
  }
});

// POST /assistant/analyze-image
router.post("/assistant/analyze-image", async (req, res) => {
  const parseResult = AnalyzeImageBody.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { imageBase64, mimeType } = parseResult.data;

  try {
    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: "انظر لصورة علبة الدواء هذه واستخرج اسم الدواء التجاري فقط بدون أي كلام آخر. إذا لم تجد اسم دواء واضح أجب بـ: غير معروف",
            },
          ],
        },
      ],
    } as Parameters<typeof openrouter.chat.completions.create>[0]);

    const rawName = response.choices[0]?.message?.content?.trim() ?? null;
    const drugName = rawName === "غير معروف" ? null : rawName;

    return res.json({ drugName, confidence: drugName ? "high" : null });
  } catch (err) {
    req.log.error({ err }, "Error analyzing image");
    return res.status(500).json({ drugName: null, confidence: null });
  }
});

export default router;
