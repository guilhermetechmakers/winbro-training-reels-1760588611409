import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Download, 
  Check, 
  X, 
  Crown,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      price: { monthly: 29, yearly: 290 },
      features: [
        'Up to 10 videos',
        'Basic analytics',
        'Email support',
        'Standard quality',
        '1 team member'
      ],
      limitations: [
        'No offline downloads',
        'No custom branding',
        'No API access'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for growing teams and organizations',
      price: { monthly: 79, yearly: 790 },
      features: [
        'Unlimited videos',
        'Advanced analytics',
        'Priority support',
        'HD quality',
        'Up to 10 team members',
        'Offline downloads',
        'Custom branding',
        'API access'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      price: { monthly: 199, yearly: 1990 },
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'SSO integration',
        'Custom integrations',
        'Dedicated support',
        'Advanced security',
        'Custom deployment',
        'Training & onboarding'
      ],
      limitations: [],
      popular: false
    }
  ];

  const currentPlan = {
    name: 'Pro',
    status: 'active',
    nextBilling: '2024-02-15',
    amount: 79,
    cycle: 'monthly',
    features: [
      'Unlimited videos',
      'Advanced analytics',
      'Priority support',
      'HD quality',
      'Up to 10 team members'
    ]
  };

  const billingHistory = [
    { id: '1', date: '2024-01-15', amount: 79, status: 'paid', invoice: 'INV-001' },
    { id: '2', date: '2023-12-15', amount: 79, status: 'paid', invoice: 'INV-002' },
    { id: '3', date: '2023-11-15', amount: 79, status: 'paid', invoice: 'INV-003' },
  ];

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    toast.success('Plan selected! Click upgrade to confirm changes.');
  };

  const handleUpgrade = () => {
    toast.success('Plan upgraded successfully!');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info(`Downloading invoice ${invoiceId}...`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing information
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <span className="text-sm text-muted-foreground">
                      ${currentPlan.amount}/{currentPlan.cycle}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-medium">{new Date(currentPlan.nextBilling).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Cycle Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
            <CardDescription>
              Select the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-8">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'yearly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save 20%</Badge>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all ${
                    selectedPlan === plan.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  } ${plan.popular ? 'border-primary' : ''}`}
                  onClick={() => handlePlanChange(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      {selectedPlan === plan.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        ${plan.price[billingCycle]}
                      </span>
                      <span className="text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium">
                          Save ${(plan.price.monthly * 12) - plan.price.yearly}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={selectedPlan === plan.id ? 'default' : 'outline'}
                      onClick={() => handlePlanChange(plan.id)}
                    >
                      {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" onClick={handleUpgrade} disabled={selectedPlan === 'pro'}>
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Invoice {invoice.invoice}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.invoice)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              Track your current usage against plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Videos</span>
                  <span className="text-sm text-muted-foreground">24 / Unlimited</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-muted-foreground">2.3 GB / 100 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '2.3%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Team Members</span>
                  <span className="text-sm text-muted-foreground">3 / 10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Subscription */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Cancel your subscription or downgrade your plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-600">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  You'll lose access to all premium features at the end of your billing period
                </p>
              </div>
              <Button variant="destructive">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
