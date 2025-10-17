# 🎛️ Admin Dashboard Guide - Softly Becoming

Complete guide to managing your automated digital wellness platform.

## 🚀 Quick Access Links

### **📊 Analytics & Monitoring**
- [**System Health**](https://softly-becoming.vercel.app/api/health) - Database, services, environment check
- [**Email Metrics**](https://softly-becoming.vercel.app/admin/metrics) - Opens, clicks, subscriber counts
- [**Content Reports**](https://softly-becoming.vercel.app/api/report) - Theme performance, posting analytics

### **📧 Newsletter Management**
- [**Newsletter Previews**](https://softly-becoming.vercel.app/admin/newsletters) - See next 7 days of automated content
- [**Letter Management**](https://softly-becoming.vercel.app/admin/letters) - Manage paid weekly letters
- [**Send Test Newsletter**](https://softly-becoming.vercel.app/api/admin/send-test-newsletter) - Test email delivery

### **🎨 Digital Products**
- [**Pack Generator**](https://softly-becoming.vercel.app/admin/packs) - Create new quote collections (Blob + Stripe)
- [**Stripe Management**](https://softly-becoming.vercel.app/admin/stripe) - Sync products, manage pricing
- [**Live Shop**](https://softly-becoming.vercel.app/shop) - See customer experience

### **🧪 Testing & Debugging**
- [**Social Media Test**](https://softly-becoming.vercel.app/test/succulent) - Test 4-platform posting
- [**Email Test**](https://softly-becoming.vercel.app/test/email) - Test email delivery
- [**Quote Preview**](https://softly-becoming.vercel.app/preview) - See generated quotes

---

## 📋 Daily Operations

### **🌅 Morning Routine (5 minutes)**
1. **Check health**: [System Health](https://softly-becoming.vercel.app/api/health)
2. **Review metrics**: [Email Analytics](https://softly-becoming.vercel.app/admin/metrics)
3. **Preview content**: [Newsletter Queue](https://softly-becoming.vercel.app/admin/newsletters)

### **💰 Weekly Business Review**
1. **Sales performance**: Check Stripe Dashboard
2. **Content performance**: [Analytics Reports](https://softly-becoming.vercel.app/api/report)
3. **Subscriber growth**: [Email Metrics](https://softly-becoming.vercel.app/admin/metrics)

### **🎨 Content Creation (As Needed)**
1. **Generate new packs**: [Pack Generator](https://softly-becoming.vercel.app/admin/packs)
2. **Sync to Stripe**: [Stripe Management](https://softly-becoming.vercel.app/admin/stripe)
3. **Test social posting**: [Succulent Test](https://softly-becoming.vercel.app/test/succulent)

---

## 🤖 Automation Status

### **✅ Fully Automated (No Action Needed)**
- **Daily Newsletter** (7:30 AM UTC) - Auto-generated from quotes
- **Social Posts** (8 AM, 2 PM, 8 PM UTC) - Scheduled via Succulent
- **Weekly Letters** (Sundays 9 AM UTC) - Paid subscriber content
- **Content Planning** (Mondays) - 4-week backlog refresh

### **🎛️ Manual Controls Available**
- **Generate products** - Create new quote collections
- **Override content** - Manual newsletter/letter sending
- **Test systems** - Verify integrations working
- **Monitor performance** - Analytics and health checks

---

## 🔧 Technical Endpoints

### **API Health Checks**
```bash
GET /api/health                    # System status
GET /api/admin/metrics             # Business metrics  
GET /api/report                    # Content analytics
```

### **Content Generation**
```bash
POST /api/generate/pack-direct     # Create product pack
POST /api/admin/newsletter-previews # Generate newsletter previews
GET /api/generate?count=5          # Generate quote samples
```

### **Testing Endpoints**
```bash
GET /api/test/succulent           # Social media integration
GET /api/test/email?email=test@example.com # Email delivery
POST /api/admin/send-test-newsletter # Newsletter testing
```

### **Business Operations**
```bash
POST /api/stripe/create-product    # Create Stripe product
POST /api/stripe/sync-products     # Bulk sync to Stripe
POST /api/upload/pack-to-blob      # Upload pack to storage
```

---

## 🎯 Troubleshooting

### **Common Issues**

**Newsletter signup fails:**
- Check [System Health](https://softly-becoming.vercel.app/api/health)
- Verify DATABASE_URL in Vercel environment variables

**Social posts not working:**
- Test [Succulent Integration](https://softly-becoming.vercel.app/test/succulent)
- Check SUCCULENT_API_KEY in environment variables

**Digital products not generating:**
- Verify BLOB_READ_WRITE_TOKEN in Vercel
- Check [Pack Generator](https://softly-becoming.vercel.app/admin/packs) for errors

**Email delivery issues:**
- Test [Email System](https://softly-becoming.vercel.app/test/email)
- Verify RESEND_API_KEY and EMAIL_FROM

### **Quick Diagnostics**
1. **System Health**: [/api/health](https://softly-becoming.vercel.app/api/health) - First place to check
2. **Function Logs**: Vercel Dashboard → Functions → View Logs
3. **Database Status**: [/admin/metrics](https://softly-becoming.vercel.app/admin/metrics)

---

## 💡 Pro Tips

### **Content Strategy**
- **Generate packs regularly** - Create scarcity and freshness
- **Monitor newsletter metrics** - Optimize send times
- **Test social content** - Use preview before auto-posting

### **Business Growth**
- **Track conversion rates** - Newsletter → Shop visits
- **Monitor pack performance** - Which themes sell best
- **Optimize pricing** - Test different license tier adoption

### **Technical Maintenance**
- **Weekly health checks** - Ensure all systems running
- **Monthly pack generation** - Keep shop fresh
- **Quarterly review** - Optimize based on metrics

---

*Your business runs itself - these tools help you monitor, optimize, and grow! 🌸*
